const fs = require('fs-promise');
const moment = require('moment');
const logger = require('../core/logger');
const { Audit, Document, Subsidiary } = require('../models');
const parser = require('../services/parser-service');
const translations = require('../../gpn-ui/src/assets/i18n/ru.json');

exports.postAudit = async (req, res) => {
  let audit = new Audit(req.body);
  audit.status = 'New';
  audit.author = res.locals.user;

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

exports.exportConclusion = async (req, res) => {
  const id = req.body.id;
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
        if (
          charterDate > audit.auditStart &&
          charterDate < audit.auditEnd &&
          charterDate > date
        ) {
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

    let violations = audit.violations;
    let documents = await Document.find(
      {
        auditId: id,
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
      if (v.document.warnings) {
        violationText +=
          'В результате выполненного анализа в документах были определены не все атрибуты\n';
        for (const warning of v.document.warnings) {
          violationText += translations[warning.code] + '\n';
        }
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

    const response = await parser.exportConclusion(
      audit.subsidiaryName,
      audit.createDate,
      audit.auditStart,
      audit.auditEnd,
      charterOrgLevels,
      violationModel
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
