const moment = require('moment');
const { Document, Audit, User } = require('../models');
const logger = require('../core/logger');
const attribute = require('../core/attribute');
const types = require('../json/document-type');
const fs = require('fs-promise');
const parser = require('../services/parser-service');

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
      include = documentFields + `analysis.attributes`;
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
        _id: d._id
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
      documentFields + `analysis auditId`
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
            }. Аудит "${audit.subsidiary.name}" ${moment(
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
            }. Аудит "${audit.subsidiary.name}" ${moment(
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
  let document = await Document.findOne(
    { _id: req.query._id },
    'user parse auditId analysis.warnings'
  );
  if (!document) {
    return logger.logError(req, res, 'Document not found', 404);
  }

  if (req.body.user) {
    const user = req.body.user;
    document.user.attributes = {};
    const attributes = attribute.getAttributeList(document.parse.documentType);
    for (let i = 0; i < document.analysis.warnings.length; i++) {
      const warning = document.analysis.warnings[i];
      if (
        (warning.code === 'date_not_found' && user.date) ||
        (warning.code === 'number_not_found' && user.number) ||
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

  try {
    if (document.user.attributes) {
      document.markModified('user.attributes');
    }
    await document.save();

    if (document.parse.documentType === 'CHARTER') {
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
          }. Аудит "${audit.subsidiary.name}" ${moment(audit.auditStart).format(
            'DD.MM.YYYY'
          )} - ${moment(audit.auditEnd).format('DD.MM.YYYY')}`
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
          }. Аудит "${audit.subsidiary.name}" ${moment(audit.auditStart).format(
            'DD.MM.YYYY'
          )} - ${moment(audit.auditEnd).format('DD.MM.YYYY')}`
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
      dates[dates.indexOf(charter.fromDate.getTime().toString()) + 1];
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

exports.getChartersForTable = async (req, res) => {
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
    const charters = result.filter(
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
    res.send(
      charters.sort((a, b) => {
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
