const fs = require('fs-promise');
const moment = require('moment');
moment.locale('ru');
const logger = require('../core/logger');
const { Audit, Document, Subsidiary, Risk } = require('../models');
const parser = require('../services/parser-service');
const translations = require('../../gpn-ui/src/assets/i18n/ru.json');

exports.postAudit = async (req, res) => {
  let audit = new Audit(req.body);
  audit.status = 'New';
  audit.author = res.locals.user;
  if (audit.ftpUrl !== null)
    try {
      await fs.access(audit.ftpUrl);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.logError(
          req,
          res,
          `No such file or directory: ${audit.ftpUrl}`,
          400
        );
      } else {
        logger.logError(req, res, err, 500);
      }
      return;
    }

  try {
    await audit.save();
    await logger.log(
      req,
      res,
      'Создание Проверки',
      `Проверка "${audit.subsidiary.name}" ${moment(audit.auditStart).format(
        'DD.MM.YYYY'
      )} - ${moment(audit.auditEnd).format('DD.MM.YYYY')}`
    );
    res.status(201).json(audit);

    parser.parseAudit(audit);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getSubsidiaries = async (req, res) => {
  try {
    const subsidiaries = await Subsidiary.find(null, '_id');
    res.send(subsidiaries);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAuditStatuses = async (req, res) => {
  try {
    let statuses = await Audit.find().distinct('status');
    res.status(200).json(statuses);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAudits = async (req, res) => {
  let where = {};

  if (req.query.name) {
    where['subsidiary.name'] = {
      $regex: `.*${req.query.name}.*`,
      $options: 'i'
    };
  }

  if (req.query.id) {
    where['_id'] = req.query.id;
  }

  try {
    let audits = await Audit.find(where, null, { lean: true });

    audits = audits.map(a => {
      a.subsidiaryName = a.subsidiary.name;
      a.sortDate = new Date(
        Math.max(a.createDate.getTime(), a.auditEnd.getTime())
      );
      return a;
    });

    const checks = [
      { 'analysis.attributes': { $exists: true } },
      { parserResponseCode: 200 }
    ];

    if (
      req.query.id &&
      audits[0] &&
      ['Finalizing', 'Done', 'Approved'].includes(audits[0].status)
    ) {
      audits[0].typeViewResult = 4;
    } else {
      for (let audit of audits) {
        audit.typeViewResult = checks.length;
        for (let check of checks) {
          check.auditId = audit._id;
          if (await Document.findOne(check)) {
            break;
          }
          audit.typeViewResult--;
        }
      }
    }

    audits.sort((a, b) => b.sortDate - a.sortDate);

    res.send(audits);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.fetchAudits = async (req, res) => {
  try {
    let sort;
    if (req.query.column) {
      sort = {
        [req.query.column === 'subsidiaryName'
          ? 'subsidiary.name'
          : req.query.column]: req.query.sort === 'asc' ? 1 : -1
      };
    }
    const where = [];
    const subsidiaryName = req.query.subsidiaryName;
    const auditStatuses = req.query.auditStatuses;
    let dateTo = req.query.dateTo;
    const dateFrom = req.query.dateFrom;
    const createDate = req.query.createDate;

    where.push({ 'pre-check': { $exists: false } });

    if (auditStatuses) {
      where.push({ status: { $in: auditStatuses.split(',') } });
    }

    if (dateTo) {
      dateTo = toDate(dateTo);
      dateTo.setDate(dateTo.getDate() + 1);
      where.push({ auditEnd: { $lt: dateTo } });
    }

    if (dateFrom) {
      where.push({ auditStart: { $gte: toDate(dateFrom) } });
    }

    if (createDate) {
      const dateTo = toDate(createDate);
      dateTo.setDate(dateTo.getDate() + 1);
      where.push({
        $and: [
          { createDate: { $lt: dateTo } },
          { createDate: { $gte: toDate(createDate) } }
        ]
      });
    }

    if (subsidiaryName) {
      where.push({
        'subsidiary.name': {
          $regex: `.*${subsidiaryName}.*`,
          $options: 'i'
        }
      });
    }

    let count;
    let audits;
    count = await Audit.countDocuments({ $and: where });
    audits = await Audit.find({ $and: where })
      .lean()
      .setOptions({
        skip: +req.query.skip,
        limit: +req.query.take,
        sort
      });

    audits = audits.map(a => {
      a.subsidiaryName = a.subsidiary && a.subsidiary.name;
      a.secondaryStatus = {};
      if (a.robot && a.robot.length !== 0) {
        const robot = a.robot[a.robot.length - 1];
        a.secondaryStatus.name = robot.request_path.split('/')[2];

        if (a.secondaryStatus.name === 'curator_request') {
          if (robot.request_sent) {
            a.secondaryStatus.name = 'curator_request_sent';
            a.secondaryStatus.date = robot.sending_date;
          } else {
            a.secondaryStatus.name = 'curator_request_not_sent';
          }
        } else if (a.secondaryStatus.name === 'confirmed') {
          if (!robot.confirmed) {
            a.secondaryStatus.name = 'not_confirmed';
          } else a.secondaryStatus.date = robot.confirmation_date;
        } else if (a.secondaryStatus.name === 'manual_register_status') {
          if (robot.register_provided) {
            a.secondaryStatus.name = 'register_provided';
            a.secondaryStatus.date = robot.register_date;
          } else {
            a.secondaryStatus.name = 'register_not_provided';
          }
        } else if (a.secondaryStatus.name === 'register_status') {
          if (robot.documents_collected) {
            a.secondaryStatus.name = 'documents_collected';
            a.secondaryStatus.date = robot.register_date;
          } else {
            a.secondaryStatus.name = 'documents_not_collected';
          }
        } else if (a.secondaryStatus.name === 'registers_mapping') {
          a.secondaryStatus.request = 'mapping/recognition';
          if (robot.all_data_collected) {
            a.secondaryStatus.name = 'all_data_collected';
            a.secondaryStatus.date = robot.new_deadline;
          } else {
            a.secondaryStatus.name = 'not_all_data_collected';
            a.secondaryStatus.count = robot.lack_of_data;
          }
          if (robot.extra_data) {
            a.secondaryStatus.extra_data = true;
          }

          a.secondaryStatus.recognition_started = {};
          if (robot.recognition_started) {
            a.secondaryStatus.recognition_started.name = 'recognition_started';
          } else {
            a.secondaryStatus.recognition_started.name =
              'recognition_not_started';
          }
        } else if (a.secondaryStatus.name === 'recognition') {
          a.secondaryStatus.request = 'mapping/recognition';
          if (robot.all_data_recognized) {
            a.secondaryStatus.name = 'all_data_recognized';
          } else {
            a.secondaryStatus.name = 'not_all_data_recognized';
            a.secondaryStatus.count = robot.lack_of_data;
          }
          a.secondaryStatus.date = robot.new_deadline;
        }
      }
      return a;
    });

    res.send({ count, audits });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

function toDate(s) {
  const parts = s.split('.');
  return new Date(parts[2], parts[1] - 1, parts[0], 3);
}

exports.deleteAudit = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete audit because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  let auditId = req.query.id;
  try {
    await Audit.deleteOne({ _id: auditId });
    await Document.deleteMany({ auditId: auditId });
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getFiles = async (req, res) => {
  try {
    const auditId = req.query.auditId;
    if (!auditId) {
      logger.logError(
        req,
        res,
        'Can not get files because auditId is null',
        400
      );
      return;
    }
    const audit = await Audit.findOne({ _id: auditId });

    if (!audit) {
      logger.logError(req, res, `Can not find audit with id ${auditId}`, 404);
      return;
    }

    let filePaths, fileObjects, errors;

    if (audit.status === 'New' || audit.status === 'Loading') {
      filePaths = await parser.getPaths(audit.ftpUrl);
    } else {
      filePaths = await Document.find({
        $or: [{ auditId }, { _id: { $in: audit.charters } }]
      }).distinct('filename');
      errors = await Document.find(
        {
          $or: [{ auditId }, { _id: { $in: audit.charters } }],
          parserResponseCode: { $ne: 200 }
        },
        null,
        { lean: true }
      );
    }

    if (!filePaths) {
      logger.logError(req, res, 'Error while getting audit files', 500);
      return;
    }

    fileObjects = filePaths.map(f => {
      let result = {
        filename: f
      };
      if (errors) {
        let error = errors.find(e => e.filename === f);
        if (error) {
          if (error.parse.message) {
            result.error = error.parse.message;
          } else {
            result.error = error.parse;
          }
        }
      }
      return result;
    });

    const files = parser.getFiles(fileObjects);

    res.status(200).json(files);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.parse = async (req, res) => {
  let auditId = req.query.id;
  if (!auditId)
    return logger.logError(
      req,
      res,
      'Cannot update audit because id is null',
      400
    );

  try {
    let audit = await Audit.findOne({ _id: auditId });
    if (!audit)
      return logger.logError(
        req,
        res,
        `Cannot find audit with id ${auditId}`,
        404
      );

    audit.status = 'Loading';
    await audit.save();

    res.status(200).send();

    let documents = await Document.find({
      auditId: auditId,
      parserResponseCode: { $ne: 200 }
    });

    for (let document of documents) {
      let filename = document.filename;
      await parser.parse(audit.ftpUrl, filename, audit);
      await Document.deleteOne({ _id: document._id });
    }

    await parser.setResult(audit);
  } catch (err) {
    logger.logError(req, res, err, 500, true);
  }
};

exports.getViolations = async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send('Required parameter `id` is not passed');
  }

  try {
    const audit = await Audit.findById(req.query.id, `violations`).lean();
    let violations = audit.violations;

    let documents = await Document.find(
      {
        auditId: req.query.id,
        'analysis.warnings': { $exists: true },
        parserResponseCode: 200,
        $where: 'this.analysis.warnings.length > 0'
      },
      'analysis.warnings analysis.attributes.number parse.documentType'
    );

    if (!violations) violations = [];

    documents.forEach(doc => {
      const v = violations.find(
        x => x.document.id.toString() === doc._id.toString()
      );
      if (v) v.document.warnings = doc.analysis.warnings;
      else {
        violations.push({
          document: {
            id: doc._id,
            number: doc.analysis.attributes.number
              ? doc.analysis.attributes.number.value
              : '',
            type: doc.parse.documentType,
            warnings: doc.analysis.warnings
          }
        });
      }
    });

    res.send(violations);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.approve = async (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).send(`Required parameter 'id' is not passed`);
  }

  try {
    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }

    if (audit.status !== 'Done') {
      return res
        .status(400)
        .send(`Cannot approve audit with status = ${audit.status}`);
    }

    audit.status = 'Approved';
    await audit.save();
    await logger.log(req, res, 'Подтверждение проверки');
    res.end();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getConclusion = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).send(`Required parameter 'id' is not passed`);
  }
  try {
    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }

    if (!audit.charters[0]) {
      return res.status(400).send('В проверке нет уставов!');
    }

    let conclusion;
    if (audit.conclusion.intro) {
      conclusion = audit.conclusion;
    } else {
      conclusion = await generateConclusion(audit);
    }
    res.send(conclusion);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.exportConclusion = async (req, res) => {
  const id = req.body.id;
  const selectedRows = req.body.selectedRows;
  if (!id) {
    return res.status(400).send(`Required parameter 'id' is not passed`);
  }

  try {
    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }

    if (!audit.charters[0]) {
      return res.status(400).send('В проверке нет уставов!');
    }
    let violationModel = [];
    if (selectedRows) {
      violationModel = getViolations(selectedRows);
    }

    let conclusion;
    if (audit.conclusion.intro) {
      conclusion = audit.conclusion;
    } else {
      conclusion = await generateConclusion(audit);
    }

    // const fs = require('fs');
    // let data = JSON.stringify(violationModel, null, 2);
    // fs.writeFileSync('test.json', data);

    const response = await parser.exportConclusion(
      audit.subsidiaryName,
      audit.createDate,
      audit.auditStart,
      audit.auditEnd,
      violationModel,
      conclusion
    );

    //Данные для формирования наименования файла .docx
    response.subsidiary = audit.subsidiaryName;
    response.auditStart = audit.auditStart;
    response.auditEnd = audit.auditEnd;

    res.send(response);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

function getViolation(violation) {
  if (
    Object.prototype.toString.call(violation.violation_type) ===
    '[object String]'
  )
    return translations[violation.violation_type];
  else {
    return translations[violation.violation_type.type];
  }
}

function getViolationEn(violation) {
  if (
    Object.prototype.toString.call(violation.violation_type) ===
    '[object String]'
  )
    return violation.violation_type;
  else {
    return violation.violation_type.type;
  }
}

async function filter(arr, callback) {
  const fail = Symbol();
  return (
    await Promise.all(
      arr.map(async item => ((await callback(item)) ? item : fail))
    )
  ).filter(i => i !== fail);
}

async function generateConclusion(audit) {
  let date = 0;
  let charterId;
  let desiredCharter = {};
  for (const c of audit.charters) {
    const doc = await Document.findOne(
      { _id: c, state: 15 },
      `state
        analysis.attributes
        user.attributes`
    );
    if (doc) {
      const charterDate = doc.getAttributeValue('date');
      if (charterDate < audit.auditEnd && charterDate > date) {
        date = charterDate;
        charterId = c;
        desiredCharter = doc;
      }
    }
  }

  const orgLevels = [
    'AllMembers',
    'ShareholdersGeneralMeeting',
    'BoardOfDirectors',
    'BoardOfCompany',
    'CEO',
    'competence_CEO'
  ];
  let charterOrgLevels = [];

  for (const orgLevel of orgLevels) {
    const level = desiredCharter.getAttributeValue(orgLevel);
    if (level) charterOrgLevels.push(orgLevel);
  }

  let riskMatrix = await Risk.find(
    {},
    `
    violation
    subject
    risk
    recommendation
    disadvantage
    `
  ).lean();
  const filteredRiskMatrix = [];
  for (let violation of audit.violations) {
    const riskArray = [];
    await filter(riskMatrix, async risk => {
      if (violation.violation_type)
        if (risk.violation === getViolationEn(violation)) {
          if (violation.document.type === 'CONTRACT') {
            let document = await Document.findOne(
              { _id: violation.document.id },
              `
                analysis.attributes
                user.attributes
                `
            );
            if (
              document.getAttributeValue('subject') === risk.subject ||
              risk.subject === 'AllDeals' ||
              risk.subject === ''
            )
              riskArray.push(risk);
          }
        }
    });
    if (riskArray.length > 0) {
      if (riskArray.length === 1) {
        filteredRiskMatrix.push(riskArray[0]);
      } else {
        filteredRiskMatrix.push(
          riskArray.filter(risk => {
            if (risk.subject !== 'AllDeals') return risk;
          })[0]
        );
      }
    }
  }
  const subsidiary = await Subsidiary.findOne({ _id: audit.subsidiaryName });
  const entity_type = subsidiary.legal_entity_type;
  const conclusion = {};
  conclusion.legal_entity_type = entity_type;
  conclusion.intro = `В целях исполнения решения Совета директоров ОАО «Газпром» от 05.09.2013 г. № 2243, поручения начальника Департамента по управлению имуществом и корпоративными отношениями ОАО «Газпром» Михайловой Е.В. от 25.11.2013 г. № 01/05-9226, руководством ПАО «Газпром нефть» (далее – «Компания», «ГПН») было принято решение о проведении Департаментом корпоративного и проектного сопровождения ГПН (далее – «ДКиПС») в период ${moment(
    audit.auditStart
  ).format('MMMM YYYY')} г. - ${moment(audit.auditEnd).format(
    'MMMM YYYY'
  )} г. аудита практики корпоративного управления (далее – «Корпоративный аудит») в дочерних обществах (далее – «ДО») Компании, в частности ${entity_type} «${
    audit.subsidiaryName
  }» (далее – «Общество»).
Цель Корпоративного аудита – выявление сильных и слабых сторон существующей в ${entity_type} «${
    audit.subsidiaryName
  }» практики корпоративного управления в сравнении со стратегическими целями Компании; подтверждение соблюдения ${entity_type} «${
    audit.subsidiaryName
  }» требований системы корпоративного управления; выявление задач, которые необходимо решить в области корпоративного управления; подготовка конкретных рекомендаций комплексного плана по совершенствованию системы корпоративного управления ${entity_type} «${
    audit.subsidiaryName
  }»; распространение лучших практик в группе Газпром нефть.
В период с ${moment(audit.createDate).format('DD.MM.YYYY')} г. по ${
    audit.status === 'Approved'
      ? moment(audit.auditEnd).format('DD.MM.YYYY')
      : moment(Date.now()).format('DD.MM.YYYY')
  } г. на основании обращения Заместителя генерального директора по правовым и корпоративным вопросам ПАО «Газпром нефть» Илюхиной Е.А. № НК-ХХ от ХХ.ХХ.ХХХХ г. (Приложение № 1) ДКиПС был проведен Корпоративный аудит ${entity_type} «${
    audit.subsidiaryName
  }».
Процедура Корпоративного аудита включала в себя:
1. Получение информации об исходном состоянии корпоративного управления.
2. Документальную проверку ${entity_type} «${
    audit.subsidiaryName
  }», в том числе:
2.1. выборочную  проверку представленной документации на предмет полноты, достоверности, правильности оформления (соответствие объема представленной документации электронной базе ДКПС).
2.2. выборочную проверку договорных документов Общества на предмет наличия/отсутствия корпоративных одобрений и их достоверности.
2.3.	проверку соблюдения Обществом требований действующего законодательства РФ по размещению информации на федеральных ресурсах.
2.4. 	проверку соблюдения Обществом требований действующего законодательства РФ по включению в ЕГРЮЛ актуальной/достоверной информации.
3. Полную проверку, представленных документов ${entity_type} «${
    audit.subsidiaryName
  }» на предмет наличия/отсутствия корпоративных одобрений и их достоверности.
4. Анализ внутренних документов ${entity_type} «${
    audit.subsidiaryName
  }», регулирующих все компоненты корпоративного управления.
По результатам проведенного Корпоративного аудита подготовлен настоящий отчет, содержащий основные результаты Корпоративного аудита, а также рекомендации ДКиПС относительно усовершенствования практики корпоративного управления ${entity_type} «${
    audit.subsidiaryName
  }».\n`;
  conclusion.shortSummary = `Ниже перечислены наиболее существенные сильные стороны и недостатки системы корпоративного управления ${entity_type} «${audit.subsidiaryName}» согласно результатам Корпоративного аудита, проведенного ДКиПС.\n`;
  conclusion.strengths = `Утверждено Положение об Общем собрании участников Общества
Утверждено Положение о распределении прибыли Общества.
Утверждено Положение о Генеральном директоре Общества.
Утверждено Положение о Совете директоров Общества (в период действия СД).
Сформирован состав Совета директоров ${entity_type} «${audit.subsidiaryName}» из членов, обладающих соответствующими знаниями, навыками, профессиональным и практическим опытом, необходимыми для успешного выполнения функций Совета директоров по управлению Обществом и принятия решений по вопросам, отнесенным к компетенции Совета директоров.\n`;
  // conclusion.corporateStructure1 = `Органами управления КН являются ${charterOrgLevels}`;
  conclusion.results1 = `В рамках проверки ДКиСП был запрошен перечень всех договоров, в том числе заключенных Обществом с обществами группы ГПН, в период с ${moment(
    audit.auditStart
  ).format('DD.MM.YYYY')} г. по ${moment(audit.auditEnd).format(
    'DD.MM.YYYY'
  )} г. Исходя из предоставленного перечня договоров была осуществлена полная проверка договоров на предмет наличия/отсутствия корпоративных одобрений таких договоров в соответствии с действующими в КН на дату заключения договоров положениями Устава.
В результате проверки выявлены следующие нарушения:\n`;
  conclusion.results2 = `В результате полной проверки иных видов дополнительных нарушений не выявлено.\n`;
  conclusion.results3 = `В рамках проведения проверки соблюдения Обществом требований по размещению на федеральном информационном ресурсе – в Едином федеральном реестре (ЕФРСФДЮЛ) юридически значимых сведений о фактах деятельности Общества нарушения не выявлены – вся содержащаяся в ЕФРСФДЮЛ информация об Обществе является актуальной и достоверной.\n`;
  conclusion.results4 = `В рамках проведения проверки соблюдения Обществом положений действующего законодательства РФ по включению в ЕГРЮЛ актуальной/достоверной информации нарушения не выявлены – вся содержащаяся в ЕГРЮЛ информация об Обществе является актуальной и достоверной.\n`;
  const riskMatrixSet = [...new Set(filteredRiskMatrix)];

  const disadvantages = riskMatrixSet.map(x => {
    return x.disadvantage;
  });
  conclusion.disadvantages = '';
  disadvantages.forEach(x => (conclusion.disadvantages += x + '\n'));

  const recommendations = riskMatrixSet.map(x => {
    return x.recommendation;
  });
  conclusion.recommendations = '';
  recommendations.forEach(x => (conclusion.recommendations += x + '\n'));

  const risks = riskMatrixSet.map(x => {
    return x.risk;
  });
  conclusion.risks = '';
  risks.forEach(x => (conclusion.risks += x + '\n'));
  // console.log(conclusion);
  return conclusion;
}

exports.postConclusion = async (req, res) => {
  try {
    const audit = await Audit.findById(req.body.id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }
    audit.conclusion = req.body.conclusion;
    audit.selectedRows = req.body.selectedRows;
    await audit.save();
    await logger.log(
      req,
      res,
      'Обновление заключения аудита',
      `Проверка "${audit.subsidiary.name}" ${moment(audit.auditStart).format(
        'DD.MM.YYYY'
      )} - ${moment(audit.auditEnd).format('DD.MM.YYYY')}`
    );
    res.send(audit.conclusion);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postSelectedViolations = async (req, res) => {
  try {
    const audit = await Audit.findById(req.body.id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }
    audit.selectedRows = req.body.selectedRows;
    // console.log(audit.selectedRows);
    await audit.save();
    res.status(200);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

getViolations = selectedRows => {
  let violations = selectedRows;

  if (!violations) violations = [];

  let violationModel = [];
  violations.map(v => {
    const violation = {};

    if (v.founding_document) {
      violation.foundingDocument =
        'Устав от ' + moment(v.founding_document.date).format('DD.MM.YYYY');
    } else {
      violation.foundingDocument = null;
    }

    if (v.reference) {
      violation.reference = v.reference.text;
    } else {
      violation.reference = null;
    }

    let violationText = '';
    if (v.violation_type) {
      violationText += getViolation(v);
      if (v.violation_type.type) {
        violationText +=
          '\nОтсутствует одобрение ' +
          translations[v.violation_type.org_structural_level] +
          ' на совершение ' +
          translations[v.violation_type.subject] +
          ' ';
      }
      if (v.violation_type.min || v.violation_type.max) {
        if (v.violation_type.min) {
          violationText +=
            'превышающих ' +
            v.violation_type.min.value +
            ' ' +
            translations[v.violation_type.min.currency];
        }
        if (v.violation_type.min && v.violation_type.max) {
          violationText += ' и';
        }
        if (v.violation_type.max) {
          violationText +=
            ' не превышающих ' +
            v.violation_type.max.value +
            ' ' +
            translations[v.violation_type.max.currency];
        }
      }
      violationText += '\n';
    }
    violation.violationType = violationText;

    let violationReason = '';
    if (v.violation_reason) {
      if (v.violation_reason.contract) {
        violationReason +=
          'Договор № ' +
          (v.violation_reason.contract.number || 'н/д') +
          ' от ' +
          moment(v.violation_reason.contract.date).format('DD.MM.YYYY') +
          ' с ' +
          (v.violation_reason.contract.org_type || '') +
          ' ' +
          (v.violation_reason.contract.org_name || 'н/д');
        if (v.violation_reason.contract.value) {
          violationReason +=
            ', цена сделки - ' +
            v.violation_reason.contract.value +
            translations[v.violation_reason.contract.currency];
        }
      }

      if (v.violation_reason.protocol) {
        violationReason += '\n';
        violationReason +=
          'Протокол ' +
          translations[v.violation_reason.protocol.org_structural_level] +
          ' от ' +
          moment(v.violation_reason.protocol.date).format('DD.MM.YYYY') +
          ' с ' +
          v.violation_reason.contract.org_type +
          ' ' +
          v.violation_reason.contract.org_name;
        if (v.violation_reason.protocol.value) {
          violationReason +=
            ', сумма - ' +
            v.violation_reason.protocol.value +
            translations[v.violation_reason.protocol.currency];
        }
      }

      if (v.violation_reason.charters) {
        violationReason += '\n';
        for (const charter of v.violation_reason.charters) {
          violationReason +=
            'Устав в редакции от ' +
            moment(charter.date).format('DD.MM.YYYY') +
            '\n';
        }
      }
    }
    violation.violationReason = violationReason;
    violationModel.push(violation);
  });
  return violationModel;
};
