const moment = require('moment');
const { Document, Audit, User } = require('../models');
const logger = require('../core/logger');
const attribute = require('../core/attribute');
const types = require('../json/document-type');

const documentFields = `filename
parse.documentDate
parse.documentType
parse.documentNumber
user
state
analysis.analyze_timestamp
analysis.version
analysis.warnings
`;

exports.getDocuments = async (req, res) => {
  if (!req.query.auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let include;
    if (req.query.full === 'false') {
      include = documentFields + `analysis.attributes`;
    }

    let documents = await Document.find(
      { auditId: req.query.auditId, parserResponseCode: 200 },
      include,
      { lean: true }
    );

    documents = documents.map(d => {
      // TODO: remove this weirdest mapping!
      let document = {
        filename: d.filename,
        state: d.state,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        _id: d._id
      };
      if (d.analysis && d.analysis.attributes) {
        if (d.user) {
          document.user = d.user;
          if (d.analysis.analyze_timestamp)
            document.analysis = {
              analyze_timestamp: d.analysis.analyze_timestamp
            };
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
        .filter(s => s.auditId.toString() === req.query.auditId)
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
      let audit = await Audit.findOne(
        { _id: document.auditId },
        `subsidiary.name auditStart auditEnd status -_id`
      ).lean();

      const type = types.find(t => t._id === document.parse.documentType);
      await logger.log(
        req,
        res,
        'Просмотр документа',
        `${type && type.name} № ${document.parse.documentNumber ||
          'н/д'} от ${document.parse.documentDate || 'н/д'}. Аудит "${
          audit.subsidiary.name
        }" ${moment(audit.auditStart).format('DD.MM.YYYY')} - ${moment(
          audit.auditEnd
        ).format('DD.MM.YYYY')}`
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
          user['org-structural-level']) ||
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
    await document.save();

    const audit = await Audit.findById(document.auditId);
    audit.status = 'InWork';
    await audit.save();

    const type = types.find(t => t._id === document.parse.documentType);
    await logger.log(
      req,
      res,
      'Изменение документа',
      `${type && type.name} № ${document.parse.documentNumber ||
        'н/д'} от ${document.parse.documentDate || 'н/д'}. Аудит "${
        audit.subsidiary.name
      }" ${moment(audit.auditStart).format('DD.MM.YYYY')} - ${moment(
        audit.auditEnd
      ).format('DD.MM.YYYY')}`
    );
    res.status(200).json(document);
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
      `filename parse.documentDate parse.documentType parse.documentNumber`,
      { lean: true }
    );

    res.status(200).json(
      documents.map(d => {
        for (let key in d.parse) d[key] = d.parse[key];
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
    let documents = await Document.find(
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

    documents = documents.map(d => {
      return {
        filename: d.filename,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        attributes: (d.analysis && d.analysis.attributes) || {},
        _id: d._id
      };
    });

    res.status(200).json(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getCharters = async (req, res) => {
  let where = {};
  if (req.query.name) {
    where['analysis.attributes.org-1-name.value'] = {
      $regex: `.*${req.query.name}.*`,
      $options: 'i'
    };
  }
  where['parse.documentType'] = 'CHARTER';
  where['parserResponseCode'] = 200;
  where['analysis.attributes'] = { $exists: true };
  try {
    let charters = await Document.find(
      where,
      `parse.documentDate
    filename
    parse.documentNumber
    analysis.attributes
    analysis.analyze_timestamp
    user.author.name
    `,
      { lean: true }
    );
    charters = charters.map(d => {
      return {
        filename: d.filename,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        attributes: (d.analysis && d.analysis.attributes) || {},
        _id: d._id,
        analysis: d.analysis,
        user: d.user
      };
    });

    res.status(200).json(charters);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

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
