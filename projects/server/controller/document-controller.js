const moment = require('moment');
const { Document, Audit, User } = require('../models');
const logger = require('../core/logger');
const attribute = require('../core/attribute');
const types = require('../json/document-type');
const fs = require('fs-promise');
const parser = require('../services/parser-service');
const roboService = require('../services/robo-service');
const schema = require('../json/schema.json');
const Ajv = require('ajv');
const addFormats = require('ajv-formats').default;
const translations = require('../../gpn-ui/src/assets/i18n/ru.json');

const documentFields = `filename
parse.documentType
user
state
analysis.analyze_timestamp
analysis.version
analysis.warnings
isActive
`;

function getAttributeValue(document, attribute) {
  if (document.user && document.user.attributes) {
    if (document.user.attributes[attribute])
      return document.user.attributes[attribute].value;
  } else if (
    document.analysis &&
    document.analysis.attributes &&
    document.analysis.attributes[attribute]
  ) {
    return document.analysis.attributes[attribute].value;
  }
}

exports.getDocuments = async (req, res) => {
  const auditId = req.query.auditId;
  if (!auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let include;
    if (req.query.full === 'false') {
      include = documentFields + `analysis.attributes primary_subject`;
    }

    const audit = await Audit.findById(auditId, `charters`, { lean: true });

    let documents = await Document.find(
      {
        $or: [{ auditId }, { _id: { $in: audit.charters } }],
        parserResponseCode: 200
      },
      include,
      { lean: true }
    );

    documents = documents.map(d => {
      // TODO: remove this weirdest mapping!
      let document = {
        filename: d.filename,
        state: d.state,
        documentType: d.parse.documentType,
        _id: d._id,
        primary_subject: d.primary_subject
      };
      if (d.analysis && d.analysis.attributes) {
        if (d.user) {
          document.user = d.user;
          if (d.analysis.analyze_timestamp) document.analysis = d.analysis;
        } else {
          document.analysis = d.analysis;
        }
      }
      return document;
    });

    const user = await User.findOne({
      login: res.locals.user.sAMAccountName
    }).lean();
    if (user) {
      const stars = user.stars
        .filter(s => s.auditId.toString() === auditId)
        .map(s => s.documentId.toString());

      for (let document of documents.filter(d =>
        stars.includes(d._id.toString())
      )) {
        document.starred = true;
      }
    }

    res.send(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocument = async (req, res) => {
  try {
    if (!req.query.id) {
      let err = `Can not find document because id is null`;
      logger.logError(req, res, err, 400);
      return;
    }

    let document = await Document.findOne(
      { _id: req.query.id, parserResponseCode: 200 },
      documentFields + `analysis auditId primary_subject`
    ).lean();

    if (document) {
      if (document.parse.documentType === 'CHARTER') {
        await logger.log(
          req,
          res,
          'Просмотр документа',
          `Устав ${getAttributeValue(document, 'org-1-name') || 'н/д'} от ${
            getAttributeValue(document, 'date')
              ? moment(getAttributeValue(document, 'date')).format('DD.MM.YYYY')
              : 'н/д'
          }.`
        );
        document.documentType = document.parse.documentType;
        document.isActive = document.isActive !== false;
        delete document.parse;
        setKeys(document);
        res.status(200).json(document);
      } else {
        let audit = await Audit.findOne(
          { _id: document.auditId },
          `subsidiary.name auditStart auditEnd status -_id`
        ).lean();

        const type = types.find(t => t._id === document.parse.documentType);
        if (document.parse.documentType === 'PROTOCOL')
          await logger.log(
            req,
            res,
            'Просмотр документа',
            `Протокол ${getAttributeValue(document, 'org-1-name') ||
              'н/д'} от ${
              getAttributeValue(document, 'date')
                ? moment(getAttributeValue(document, 'date')).format(
                    'DD.MM.YYYY'
                  )
                : 'н/д'
            }. Проверка "${audit.subsidiary.name}" ${moment(
              audit.auditStart
            ).format('DD.MM.YYYY')} - ${moment(audit.auditEnd).format(
              'DD.MM.YYYY'
            )}`
          );
        else
          await logger.log(
            req,
            res,
            'Просмотр документа',
            `${type && type.name} № ${getAttributeValue(document, 'number') ||
              'н/д'} от ${
              getAttributeValue(document, 'date')
                ? moment(getAttributeValue(document, 'date')).format(
                    'DD.MM.YYYY'
                  )
                : 'н/д'
            }. Проверка "${audit.subsidiary.name}" ${moment(
              audit.auditStart
            ).format('DD.MM.YYYY')} - ${moment(audit.auditEnd).format(
              'DD.MM.YYYY'
            )}`
          );

        if (audit) {
          audit.subsidiaryName = audit.subsidiary.name;
          delete audit.subsidiary;
          document.statusAudit = audit.status;
          document.documentDate = document.parse.documentDate;
          document.documentType = document.parse.documentType;
          document.documentNumber = document.parse.documentNumber;
          document.audit = audit;
          delete document.parse;

          if (document.user) {
            delete document.analysis.attributes;
          }
          setKeys(document);
          res.status(200).json(document);
        } else {
          let err = `Can not find audit with id ${document.auditId}`;
          logger.logError(req, res, err, 404);
        }
      }
    } else {
      let err = `Can not find document with id ${req.query.id}`;
      logger.logError(req, res, err, 404);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateDocument = async (req, res) => {
  try {
    let document = await Document.findOne(
      { _id: req.query._id },
      'user parse auditId analysis.warnings'
    );
    if (!document) {
      return logger.logError(req, res, 'Document not found', 404);
    }

    // if (req.body.documentType && document.parse.documentType!==req.body.documentType){
    //   document.parse.documentType = req.body.documentType;
    // }

    if (req.body.user) {
      const user = req.body.user;
      document.user.attributes = {};
      document.user.attributes_tree = {};
      let attributesUI = user;
      let attributeTree = {};
      const documentType = document.parse.documentType;
      if (documentType === 'PROTOCOL') {
        attributeTree.agenda_items = [];
      }
      let error = { message: '' };
      if (documentType === 'CHARTER') {
        document.user.attributes_tree[
          documentType.toLowerCase()
        ] = setCharterTree(attributesUI, error);
        if (error.message) {
          res
            .status(400)
            .json({ msg: 'error', details: error.message.toString() });
          return;
        }
      } else if (
        documentType === 'CONTRACT' ||
        documentType === 'ANNEX' ||
        documentType === 'SUPPLEMENTARY_AGREEMENT'
      ) {
        document.user.attributes_tree[
          documentType.toLowerCase()
        ] = setContractTree(attributesUI, error);
        if (error.message) {
          res
            .status(400)
            .json({ msg: 'error', details: error.message.toString() });
          return;
        }
      } else if (documentType === 'PROTOCOL') {
        document.user.attributes_tree[
          documentType.toLowerCase()
        ] = setProtocolTree(attributesUI, error);
        if (error.message) {
          res
            .status(400)
            .json({ msg: 'error', details: error.message.toString() });
          return;
        }
      }

      const attributes = attribute.getAttributeList(
        document.parse.documentType
      );
      for (let i = 0; i < document.analysis.warnings.length; i++) {
        const warning = document.analysis.warnings[i];
        if (
          (warning.code === 'date_not_found' && user.date) ||
          (warning.code === 'number_not_found' && user.number) ||
          (warning.code === 'contract_value_not_found' &&
            user['sign_value_currency/value']) ||
          (warning.code === 'contract_value_not_found' &&
            user['subject/sign_value_currency/currency']) ||
          (warning.code === 'protocol_agenda_not_found' &&
            user['agenda_item']) ||
          (warning.code === 'org_name_not_found' &&
            (user['org-1-name'] || user['org-2-name'])) ||
          (warning.code === 'org_type_not_found' &&
            (user['org-1-type'] || user['org-2-type'])) ||
          (warning.code === 'org_struct_level_not_found' &&
            user['org_structural_level']) ||
          (warning.code === 'value_section_not_found' &&
            user['sign_value_currency']) ||
          ((warning.code === 'subject_section_not_found' ||
            warning.code === 'contract_subject_not_found' ||
            warning.code === 'contract_subject_section_not_found') &&
            user.subject)
        ) {
          if (!document.analysis.resolvedWarnings)
            document.analysis.resolvedWarnings = [];
          document.analysis.resolvedWarnings.push(warning);
          document.analysis.warnings.splice(i);
        }
      }
      for (let key in user) {
        const parts = key.split('/');
        const kind = parts[parts.length - 1];
        const attribute = attributes.find(a => a.kind === kind);
        if (attribute) {
          switch (attribute.type) {
            case 'date':
              user[key].value = new Date(user[key].value);
              break;
            case 'number':
              user[key].value = +user[key].value;
              break;
          }
          if (attribute.kind === 'sign') {
            user[key].value = +user[key].value;
          }
        }

        document.user.attributes[key] = user[key];
      }
    }

    document.user.author = res.locals.user;
    document.user.updateDate = new Date();
    document.user.analyze_timestamp = document.analysis.analyze_timestamp;
    document.state = 5;

    if (document.user.attributes_tree) {
      document.markModified('user.attributes_tree');
    }

    await document.save();

    if (document.parse.documentType === 'CHARTER') {
      const audits = await Audit.find({
        charters: document._id,
        status: { $ne: 'Approved' }
      });
      for (const audit of audits) {
        audit.status = 'InWork';
        await audit.save();
      }
      await logger.log(
        req,
        res,
        'Изменение документа',
        `Устав ${getAttributeValue(document, 'org-1-name') || 'н/д'} от ${
          getAttributeValue(document, 'date')
            ? moment(getAttributeValue(document, 'date')).format('DD.MM.YYYY')
            : 'н/д'
        }.`
      );
      document.documentType = document.parse.documentType;
      delete document.parse;
      res.status(200).json(document);
    } else {
      const audit = await Audit.findById(document.auditId);
      audit.status = 'InWork';
      await audit.save();

      const type = types.find(t => t._id === document.parse.documentType);
      if (document.parse.documentType === 'PROTOCOL')
        await logger.log(
          req,
          res,
          'Изменение документа',
          `Протокол ${getAttributeValue(document, 'org-1-name') || 'н/д'} от ${
            getAttributeValue(document, 'date')
              ? moment(getAttributeValue(document, 'date')).format('DD.MM.YYYY')
              : 'н/д'
          }. Проверка "${audit.subsidiary.name}" ${moment(
            audit.auditStart
          ).format('DD.MM.YYYY')} - ${moment(audit.auditEnd).format(
            'DD.MM.YYYY'
          )}`
        );
      else
        await logger.log(
          req,
          res,
          'Изменение документа',
          `${type && type.name} № ${getAttributeValue(document, 'number') ||
            'н/д'} от ${
            getAttributeValue(document, 'date')
              ? moment(getAttributeValue(document, 'date')).format('DD.MM.YYYY')
              : 'н/д'
          }. Проверка "${audit.subsidiary.name}" ${moment(
            audit.auditStart
          ).format('DD.MM.YYYY')} - ${moment(audit.auditEnd).format(
            'DD.MM.YYYY'
          )}`
        );
      res.status(200).json(document);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAttributes = async (req, res) => {
  if (!req.query.name) {
    let err = `Can not find attributes because type name is null`;
    logger.logError(req, res, err, 400);
    return;
  }

  const attributes = attribute.getAttributeTree(req.query.name);
  if (attributes) {
    res.send(attributes);
  } else {
    let err = `Can not find document type with name ${req.query.name}`;
    logger.logError(req, res, err, 404);
  }
};

exports.getLinks = async (req, res) => {
  const documentId = req.query.documentId;

  if (!documentId) {
    let err = `Can not get links for document because documentId is null`;
    logger.logError(req, res, err, 400);
    return;
  }

  const document = await Document.findById(documentId).lean();
  if (!document)
    return res.status(404).send(`Document with id = '${documentId}' not found`);

  const audit = await Audit.findById(document.auditId).lean();
  if (!audit)
    return res
      .status(500)
      .send(`Audit with id = '${document.auditId}' not found`);

  try {
    if (!audit.links) {
      return res.send([]);
    }

    let ids = audit.links
      .filter(l => l.fromId.toString() === documentId)
      .map(l => l.toId)
      .concat(
        audit.links
          .filter(l => l.toId.toString() === documentId)
          .map(l => l.fromId)
      );

    const documents = await Document.find(
      {
        _id: { $in: ids },
        parserResponseCode: 200
      },
      `filename user analysis parse.documentType`,
      { lean: true }
    );

    res.status(200).json(
      documents.map(d => {
        d.documentNumber = getAttributeValue(d, 'number');
        d.documentDate = getAttributeValue(d, 'date');
        d.documentType = d.parse.documentType;
        delete d.parse;
        return d;
      })
    );
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postLink = async (req, res) => {
  const fromId = req.body.fromId;
  const toId = req.body.toId;

  try {
    const linkInfo = await getLinkInfo(fromId, toId);
    if (linkInfo.error) return res.status(400).send(linkInfo.error);
    const audit = linkInfo.audit;

    if (!audit.links) {
      audit.links = [];
    }

    audit.links.push(req.body);
    await Audit.findOneAndUpdate({ _id: audit._id }, { links: audit.links });
    await logger.log(req, res, 'Добавление связи документов');
    res.sendStatus(201);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

async function getLinkInfo(fromId, toId) {
  if (!fromId || !toId) {
    return {
      error: `One of required parameters 'toId' or 'fromId' is not passed`
    };
  }

  const document1 = await Document.findById(fromId).lean();
  const document2 = await Document.findById(toId).lean();

  if (document2 && document2.documentType !== 'CHARTER')
    if (
      !document1 ||
      !document2 ||
      document1.auditId.toString() !== document2.auditId.toString()
    ) {
      return {
        error:
          'One of documents is not found or documents belong to different audits'
      };
    }

  const audit = await Audit.findById(document1.auditId).lean();

  if (!audit) {
    return {
      error: 'Audit not found'
    };
  }

  return { audit };
}

exports.deleteLink = async (req, res) => {
  const fromId = req.query.fromId;
  const toId = req.query.toId;

  try {
    const linkInfo = await getLinkInfo(fromId, toId);
    if (linkInfo.error) return res.status(400).send(linkInfo.error);
    const audit = linkInfo.audit;

    await Audit.findOneAndUpdate(
      {
        _id: audit._id
      },
      {
        $pull: {
          links: {
            $or: [
              { toId, fromId },
              { toId: fromId, fromId: toId }
            ]
          }
        }
      }
    );

    await logger.log(req, res, 'Удаление связи документов');
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocumentsByType = async (req, res) => {
  if (!req.query.auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  if (!req.query.type) {
    let err = 'Can not find documents: type is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let documents;
    if (req.query.type !== 'CHARTER')
      documents = await Document.find(
        {
          auditId: req.query.auditId,
          'parse.documentType': req.query.type,
          parserResponseCode: 200
        },
        `parse.documentDate
    filename
    parse.documentNumber
    analysis.attributes
    `,
        { lean: true }
      );
    else {
      const where = {
        'parse.documentType': 'CHARTER',
        parserResponseCode: 200,
        analysis: { $exists: true },
        $and: [
          // признак активности
          {
            $or: [
              { isActive: true },
              { isActive: null },
              { isActive: { $exists: false } }
            ]
          },
          {
            $or: [
              // если существует user
              {
                // существует атрибут date
                'user.attributes.date': { $exists: true }
              },
              // если существует только analysis
              {
                user: null,
                // существует атрибут date
                'analysis.attributes.date': { $exists: true }
              }
            ]
          }
        ]
      };
      documents = await Document.find(
        where,
        `filename user analysis parse.documentType`,
        { lean: true }
      );
    }

    documents = documents.map(d => {
      return {
        filename: d.filename,
        documentDate: getAttributeValue(d, 'date'),
        documentType: d.parse.documentType,
        documentNumber: getAttributeValue(d, 'number'),
        attributes:
          (d.user && d.user.attributes) ||
          (d.analysis && d.analysis.attributes) ||
          {},
        _id: d._id
      };
    });

    res.status(200).json(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getCharters = async (req, res) => {
  const allSubsidiariesRegexp = /.*все до$/i;
  const name = req.query.name;

  // Все ДО, если совпадает с регэкспом или не пришел параметр name
  const allSubsidiaries = allSubsidiariesRegexp.test(name) || !name;
  const mongoRegexp = {
    $regex: `.*${allSubsidiaries ? '' : name}.*`,
    $options: 'i'
  };

  const where = {
    'parse.documentType': 'CHARTER',
    parserResponseCode: 200,
    analysis: { $exists: true },
    $and: [
      // признак активности
      {
        $or: [
          { isActive: true },
          { isActive: null },
          { isActive: { $exists: false } }
        ]
      },
      {
        $or: [
          // если существует user
          {
            // существует атрибут date
            'user.attributes.date': { $exists: true },
            // фильтр по наименованию ДО
            'user.attributes.org-1-name.value': mongoRegexp
          },
          // если существует только analysis
          {
            user: null,
            // существует атрибут date
            'analysis.attributes.date': { $exists: true },
            // фильтр по наименованию ДО
            'analysis.attributes.org-1-name.value': mongoRegexp
          }
        ]
      }
    ]
  };

  try {
    const charters = await Document.find(
      where,
      `parse.documentDate
    filename
    parse.documentNumber
    user.author.name
    analysis.attributes.date.value
    user.attributes.date.value
    analysis.attributes.org-1-name
    user.attributes.org-1-name`
    );

    const result = charters.map(c => {
      return {
        _id: c._id,
        fromDate: c.getAttributeValue('date'),
        subsidiary: c.getAttributeValue('org-1-name')
      };
    });

    if (allSubsidiaries) {
      // получаем все возможные наименования ДО
      const subsidiaries = Object.keys(
        result.reduce((previous, current) => {
          previous[current.subsidiary] = true;
          return previous;
        }, {})
      );

      for (const subsidiary of subsidiaries) {
        setToDate(result.filter(c => c.subsidiary === subsidiary));
      }
    } else {
      setToDate(result);
    }

    res.send(
      result.sort((a, b) => {
        // сортировка по наименованию ДО
        if (a.subsidiary > b.subsidiary) return 1;
        if (a.subsidiary < b.subsidiary) return -1;
        // сортировка по дате
        return a.fromDate - b.fromDate;
      })
    );
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

function setToDate(charters) {
  // получаем все возможные даты и сортируем по возрастанию
  const dates = Object.keys(
    charters.reduce((previous, current) => {
      previous[current.fromDate.getTime()] = true;
      return previous;
    }, {})
  ).sort((a, b) => a - b);

  // дата "по" будет равна следующей дате из массива
  for (const charter of charters) {
    charter.toDate =
      dates[dates.indexOf(charter.fromDate.getTime().toString()) + 1] -
      86400000;
  }
}

exports.addStar = async (req, res) => {
  const id = req.body.id;
  if (!id) return res.status(400).send(`Required parameter 'id' is not passed`);

  try {
    let user = await User.findOne({ login: res.locals.user.sAMAccountName });
    if (!user) user = new User({ login: res.locals.user.sAMAccountName });

    const document = await Document.findById(id);

    if (document && user.stars && !user.stars.find(s => s.documentId === id)) {
      user.stars.push({
        documentId: id,
        auditId: document.auditId
      });
      await user.save();
    }

    res.end();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.deleteStar = async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send(`Required parameter 'id' is not passed`);

  try {
    const user = await User.findOne({ login: res.locals.user.sAMAccountName });
    if (!user) return res.end();

    let index = user.stars.map(s => s.documentId).indexOf(id);

    if (index >= 0) {
      user.stars.splice(index, 1);
    }

    await user.save();

    res.end();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.charterActivation = async (req, res) => {
  const id = req.body.id;
  const action = req.body.action;
  if (!id) return res.status(400).send(`Required parameter 'id' is not passed`);
  try {
    await Document.findOneAndUpdate({ _id: id }, { isActive: action });
    res.end();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postCharter = async (req, res) => {
  let charter = new Document(req.body);
  try {
    await fs.access(charter.ftpUrl);
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.logError(req, res, `No such file: ${charter.ftpUrl}`, 400);
    } else {
      logger.logError(req, res, err, 500);
    }
    return;
  }

  const stat = await fs.stat(charter.ftpUrl);
  if (stat.isDirectory()) {
    logger.logError(req, res, `${charter.ftpUrl} is not a file`, 400);
    return;
  }

  try {
    await parser.parseFile(charter);
    if (
      charter.parserResponseCode === 200 &&
      charter.parse.documentType === 'CHARTER'
    ) {
      await charter.save();
      await logger.log(
        req,
        res,
        'Загрузка устава',
        `Имя файла: '${charter.filename}'
      `
      );
      res.status(201).json(charter);
    } else if (
      charter.parserResponseCode === 504 ||
      charter.parserResponseCode === 0
    )
      logger.logError(req, res, charter.parse.message, 400);
    else {
      logger.logError(req, res, 'Not a charter', 400);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

function toDate(s) {
  const parts = s.split('.');
  return new Date(parts[2], parts[1] - 1, parts[0], 3);
}

exports.fetchCharters = async (req, res) => {
  let sortColumn;
  let sortDirection;
  if (req.query.column) {
    sortColumn = req.query.column;
    sortDirection = req.query.sort === 'asc';
  }

  const allSubsidiariesRegexp = /.*все до$/i;
  const name = req.query.subsidiaryName;
  const showInactive = req.query.showInactive === 'true';
  const charterStatuses = req.query.charterStatuses;
  let dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;

  // Все ДО, если совпадает с регэкспом или не пришел параметр name
  const allSubsidiaries = allSubsidiariesRegexp.test(name) || !name;
  const mongoRegexp = {
    $regex: `.*${allSubsidiaries ? '' : name}.*`,
    $options: 'i'
  };

  const where = {
    'parse.documentType': 'CHARTER',
    parserResponseCode: 200,
    $or: [
      // если существует user
      {
        // фильтр по наименованию ДО
        'user.attributes.org-1-name.value': mongoRegexp
      },
      // если существует только analysis
      {
        user: null,
        // фильтр по наименованию ДО
        'analysis.attributes.org-1-name.value': mongoRegexp
      },
      {
        // Те уставы, в которых нет этих полей
        'analysis.attributes.org-1-name.value': undefined,
        'user.attributes.org-1-name.value': undefined
      }
    ]
  };
  try {
    const docs = await Document.find(
      where,
      `
    createDate
    state
    user.author.name
    analysis.analyze_timestamp
    isActive
    subsidiary.name
    analysis.attributes.date.value
    user.attributes.date.value
    analysis.attributes.org-1-name
    user.attributes.org-1-name`
    );
    const result = docs.map(c => {
      return {
        _id: c._id,
        fromDate: c.getAttributeValue('date') || null,
        subsidiary:
          c.getAttributeValue('org-1-name') ||
          (!c.analysis.attributes && c.subsidiary.name) ||
          null,
        analyze_timestamp: c.analysis.analyze_timestamp || c.createDate,
        user: c.user.author && c.user.author.name,
        isActive: c.isActive !== false,
        toDate: null,
        state: c.state || null
      };
    });

    //Уставы с валидными полями
    let charters = result.filter(
      result => result.fromDate && result.subsidiary
    );

    //Уставы с невалидными полями
    const badCharters = result.filter(
      result => !(result.fromDate && result.subsidiary)
    );

    const subsidiaries = Object.keys(
      result.reduce((previous, current) => {
        previous[current.subsidiary] = true;
        return previous;
      }, {})
    );

    for (const subsidiary of subsidiaries) {
      setToDate(charters.filter(c => c.subsidiary === subsidiary));
    }

    if (allSubsidiaries) {
      for (let i = 0; i < badCharters.length; i++) {
        charters.push(badCharters[i]);
      }
    } else {
      const regExp = new RegExp(name);
      for (let i = 0; i < badCharters.length; i++) {
        if (regExp.test(badCharters[i].subsidiary))
          charters.push(badCharters[i]);
      }
    }
    let start = req.query.skip;
    let end;
    if (start) {
      end = +start + +req.query.take;
    } else end = req.query.take;

    if (!showInactive) {
      charters = charters.filter(x => x.isActive === true);
    }

    if (charterStatuses) {
      charters = charters.filter(x =>
        charterStatuses.split(',').includes(x.state.toString())
      );
    }

    if (dateTo) {
      dateTo = toDate(dateTo);
      charters = charters.filter(x => x.toDate <= dateTo);
    }

    if (dateFrom) {
      dateFrom = toDate(dateFrom);
      charters = charters.filter(x => x.fromDate >= dateFrom);
    }

    let count = charters.length;
    charters = charters
      .sort((a, b) => {
        switch (sortColumn) {
          case 'subsidiaryName':
            return a.subsidiary > b.subsidiary === sortDirection ? 1 : -1;
          case 'charterStart':
            return a.fromDate > b.fromDate === sortDirection ? 1 : -1;
          case 'charterEnd':
            if (a.toDate && b.toDate)
              return a.toDate > b.toDate === sortDirection ? 1 : -1;
            else if (a.toDate) {
              return sortDirection ? 1 : -1;
            } else if (b.toDate) {
              return !sortDirection ? 1 : -1;
            } else return 0;
          case 'lastEditDate':
            return a.analyze_timestamp > b.analyze_timestamp === sortDirection
              ? 1
              : -1;
        }
      })
      .slice(start, end);

    res.send({ count, charters });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.uploadFiles = async (req, res) => {
  try {
    const author = res.locals.user;
    await roboService.postFiles(req.body, author);
    res.status(201).json();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

setKeys = document => {
  const orgAttributes = ['name', 'type', 'alt_name', 'alias'];
  let attributes_tree = {};
  if (document.user && document.user.attributes_tree) {
    attributes_tree = document.user.attributes_tree;
  } else if (document.analysis.attributes_tree) {
    attributes_tree = document.analysis.attributes_tree;
  }

  let attributes = [];
  if (attributes_tree) {
    const doc_type = Object.keys(attributes_tree)[0];
    //Договоры
    let contract = {};
    if (doc_type === 'contract') {
      contract = attributes_tree.contract;
    } else if (doc_type === 'annex') {
      contract = attributes_tree.annex;
    } else if (doc_type === 'supplementary_agreement') {
      contract = attributes_tree.supplementary_agreement;
    }
    if (contract) {
      if (contract.date) {
        contract.date.kind = 'date';
        contract.date.key = 'date';
        attributes.push(contract.date);
      }
      if (contract.number) {
        contract.number.kind = 'number';
        contract.number.key = 'number';
        attributes.push(contract.number);
      }
      if (contract.orgs) {
        for (let i = 0; i < contract.orgs.length; i++) {
          Object.keys(contract.orgs[i]).forEach(x => {
            contract.orgs[i][x].kind = 'org' + '-' + (i + 1) + '-' + x;
            contract.orgs[i][x].key = contract.orgs[i][x].kind;
            attributes.push(contract.orgs[i][x]);
          });
        }
      }
      if (contract.price) {
        contract.price.kind = 'price';
        contract.price.key = 'price';
        const price = contract.price;
        attributes.push(contract.price);
        Object.keys(price).forEach(x => {
          if (
            x === 'amount' ||
            x === 'currency' ||
            (x === 'sign' && price[x].span[0] !== price[x].span[1])
          ) {
            price[x].kind = x;
            price[x].key = price.key + '/' + price[x].kind;
            price[x].parent = price.key;
            attributes.push(price[x]);
          }
        });
      }
      if (contract.insideInformation) {
        contract.insideInformation.kind = 'insideInformation';
        contract.insideInformation.key = contract.insideInformation.kind;
        attributes.push(contract.insideInformation);
      }
      if (contract.subject) {
        contract.subject.kind = 'subject';
        contract.subject.key = 'subject';
        attributes.push(contract.subject);
        const price = contract.subject.price;
        if (price) {
          price.kind = 'price';
          price.key = contract.subject.key + '/' + price.kind;
          attributes.push(price);
          Object.keys(price).forEach(x => {
            if (x === 'amount' || x === 'currency' || x === 'sign') {
              price[x].kind = x;
              price[x].key = price.key + '/' + price[x].kind;
              price[x].parent = price.key;
              attributes.push(price[x]);
            }
          });
        }
        const insideInformation = contract.subject.insideInformation;
        if (insideInformation) {
          insideInformation.kind = 'insideInformation';
          insideInformation.key =
            contract.subject.key + '/' + insideInformation.kind;
          attributes.push(insideInformation);
        }
      }
    }

    //Уставы
    const charter = attributes_tree.charter;
    if (charter) {
      if (charter.date) {
        charter.date.kind = 'date';
        charter.date.key = 'date';
        attributes.push(charter.date);
      }
      if (charter.org) {
        Object.keys(charter.org).forEach(x => {
          if (orgAttributes.includes(x)) {
            charter.org[x].kind = 'org-1-' + x;
            charter.org[x].key = charter.org[x].kind;
            attributes.push(charter.org[x]);
          }
        });
      }
      if (charter.structural_levels) {
        for (let i = 0; i < charter.structural_levels.length; i++) {
          const structuralLevel = charter.structural_levels[i];
          if (structuralLevel.value) {
            structuralLevel.kind = structuralLevel.value;
            structuralLevel.key = structuralLevel.kind;
            attributes.push(structuralLevel);
            const competences = structuralLevel.competences;
            if (competences) {
              for (let j = 0; j < competences.length; j++) {
                const competence = competences[j];
                if (competence.value) {
                  competence.kind = competence.value;
                  const num = attributes.filter(
                    c =>
                      c.parent === structuralLevel.kind &&
                      c.kind === competence.kind
                  ).length;
                  competence.key =
                    structuralLevel.key + '/' + competence.kind + '-' + num;
                  competence.parent = structuralLevel.key;
                  attributes.push(competence);
                  const constraints = competence.constraints;
                  if (constraints) {
                    for (let k = 0; k < constraints.length; k++) {
                      const constraint = constraints[k];
                      constraint.kind = 'constraint';
                      constraint.key =
                        competence.key + '/' + constraint.kind + '-' + k;
                      constraint.parent = competence.key;
                      attributes.push(constraint);
                      Object.keys(constraint).forEach(x => {
                        if (
                          x === 'amount' ||
                          x === 'currency' ||
                          x === 'sign'
                        ) {
                          constraint[x].kind = x;
                          constraint[x].key =
                            constraint.key + '/' + constraint[x].kind;
                          constraint[x].parent = constraint.key;
                          attributes.push(constraint[x]);
                        }
                      });
                    }
                  }
                }
              }
              charter.structural_levels[i].competences = competences;
            }
          }
        }
      }
    }

    const protocol = attributes_tree.protocol;
    if (protocol) {
      if (protocol.date) {
        protocol.date.kind = 'date';
        protocol.date.key = 'date';
        attributes.push(protocol.date);
      }

      if (protocol.org) {
        Object.keys(protocol.org).forEach(x => {
          if (orgAttributes.includes(x)) {
            protocol.org[x].kind = 'org-1-' + x;
            protocol.org[x].key = protocol.org[x].kind;
            attributes.push(protocol.org[x]);
          }
        });
      }

      if (protocol.structural_level) {
        protocol.structural_level.kind = 'structural_level';
        protocol.structural_level.key = 'structural_level';
        attributes.push(protocol.structural_level);
      }

      const agenda_items = protocol.agenda_items;
      if (agenda_items) {
        for (let i = 0; i < protocol.agenda_items.length; i++) {
          const agenda_item = protocol.agenda_items[i];
          agenda_item.kind = 'agenda_item';
          agenda_item.key = agenda_item.kind + '-' + i;
          attributes.push(agenda_item);
          if (agenda_item.contract && agenda_item.contract.orgs) {
            for (let j = 0; j < agenda_item.contract.orgs.length; j++) {
              const org = agenda_item.contract.orgs[j];
              if (org) {
                Object.keys(org).forEach(x => {
                  if (j === 0) {
                    org[x].kind = 'org-1-' + x;
                    org[x].key = agenda_item.key + '/' + org[x].kind;
                    org[x].parent = agenda_item.key;
                  } else {
                    org[x].kind = 'org-2-' + x;
                    org[x].key = agenda_item.key + '/' + org[x].kind + '-' + j;
                    org[x].parent = agenda_item.key;
                  }
                  attributes.push(org[x]);
                });
              }
            }
          }
        }
      }
    }
    if (document.user) {
      document.user.attributes = attributes;
    } else {
      document.analysis.attributes = attributes;
    }
  }
};

setCharterTree = (userAttributes, error) => {
  let attributeTree = {};
  const structuralLevelsList = [
    'CEO',
    'ShareholdersGeneralMeeting',
    'BoardOfDirectors',
    'BoardOfCompany',
    'AllMembers'
  ];
  let structuralLevels = [];
  attributeTree.org = {};
  // console.log(userAttributes);
  Object.keys(userAttributes).forEach(name => {
    const y = userAttributes[name];
    const key = y.key;
    let atr = key.split('/');
    if (atr.length === 1) {
      let arr = key.split('-');
      if (key === 'org-1-name' || key === 'org-1-type') {
        attributeTree.org[arr[2]] = y;
      } else if (structuralLevelsList.includes(arr[0])) {
        y.value = y.kind;
        delete y.competences;
        structuralLevels.push(y);
      } else {
        attributeTree[arr[0]] = y;
      }
    } else if (atr.length === 2) {
      const lvl = y.parent.split('-')[0];
      delete y.parent;
      if (structuralLevelsList.includes(lvl)) {
        let structuralLevel = structuralLevels.find(l => l.key === lvl);
        const index = structuralLevels.findIndex(l => l.key === lvl);
        structuralLevels.splice(index, 1);
        if (structuralLevel) {
          if (!structuralLevel.competences) {
            structuralLevel.competences = [];
          }
          y.value = y.kind;
          delete y.constraints;
          structuralLevel.competences.push(y);
          structuralLevels.push(structuralLevel);
        }
      }
    } else if (atr.length === 3) {
      if (atr[2].startsWith('constraint')) {
        const level = structuralLevels.find(l => {
          return l.key === atr[0];
        });
        const competence = level.competences.find(c => {
          return c.key === atr[0] + '/' + atr[1];
        });
        if (!competence.constraints) {
          competence.constraints = [];
        }
        competence.constraints.push(y);
      }
    } else if (atr.length === 4) {
      const level = structuralLevels.find(l => {
        return l.key === atr[0];
      });
      const competence = level.competences.find(c => {
        return c.key === atr[0] + '/' + atr[1];
      });
      const constraint_atr = atr[3].split('-');
      for (const c of competence.constraints) {
        if (c.key === atr[0] + '/' + atr[1] + '/' + atr[2]) {
          if (y.kind === 'amount') {
            y.value = Number.parseInt(y.value);
          }
          c[constraint_atr[0]] = y;
        }
      }
    }
  });
  attributeTree.structural_levels = structuralLevels;

  const data = { charter: attributeTree };

  validateSchema(data, schema, error);

  return attributeTree;
};

setContractTree = (userAttributes, error) => {
  let attributeTree = {};
  let org1 = {};
  let org2 = {};
  Object.keys(userAttributes).forEach(name => {
    const y = userAttributes[name];
    const key = y.key;
    let atr = key.split('/');
    if (atr.length === 1) {
      let arr = key.split('-');
      //org-1-name,
      if (arr[0] === 'org') {
        if (arr[1] === '1') {
          org1[arr[2]] = y;
        } else {
          org2[arr[2]] = y;
        }
      } else {
        attributeTree[arr[0]] = y;
      }
    } else if (atr.length === 2) {
      //subject
      if (atr[0] === 'subject') {
        attributeTree[atr[0]][atr[1]] = y;
      } else if (atr[0] === 'price') {
        if (y.kind === 'sign') {
          //Баг анализатора, sign value может быть 0
          if (y.value === null) {
            y.value = 0;
          }
        }
        attributeTree[atr[0]][atr[1]] = y;
      }
    } else if (atr.length === 3) {
      if (atr[0] === 'subject') {
        attributeTree[atr[0]][atr[1]][atr[2]] = y;
      }
    }
  });
  if (org1 || org2) {
    attributeTree.orgs = [org1, org2];
  }

  const data = { contract: attributeTree };

  validateSchema(data, schema, error);

  return attributeTree;
};

//TODO: доделать протоколы
setProtocolTree = (userAttributes, error) => {
  let attributeTree = {};
  attributeTree.org = {};
  attributeTree.agenda_items = [];
  Object.keys(userAttributes).forEach(name => {
    const y = userAttributes[name];
    const key = y.key;
    let atr = key.split('/');
    if (atr.length === 1) {
      // console.log(atr);
      let arr = key.split('-');
      if (
        key === 'org-1-name' ||
        key === 'org-1-type' ||
        key === 'org-1-alt_name' ||
        key === 'org-1-alias'
      ) {
        attributeTree.org[arr[2]] = y;
      } else if (key === 'org_structural_level') {
        attributeTree.structural_level = y;
      } else if (arr[0] === 'agenda_item') {
        y.orgs = [];
        attributeTree.agenda_items.push(y);
      }
    } else if (atr.length === 2) {
    }
  });

  const data = { charter: attributeTree };

  validateSchema(data, schema, error);

  return attributeTree;
};

validateSchema = (data, schema, error) => {
  const ajv = new Ajv({ strictTypes: false, allErrors: true });
  require('ajv-errors')(ajv /*, {singleError: true} */);

  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    validate.errors.forEach(m => {
      const pathArray = m.instancePath.split('/');
      let path;
      if (isNaN(Number(pathArray[pathArray.length - 1]))) {
        path = translate(pathArray[pathArray.length - 1]);
      } else {
        path = translate(pathArray[pathArray.length - 2]);
      }
      error.message += path + ': ' + m.message + '\n';
    });
  }
};

translate = message => {
  return translations[message];
};
