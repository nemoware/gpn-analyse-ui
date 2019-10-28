const db = require('../config/db.config');
const logger = require('../core/logger');
const Document = db.Document;
const DocumentType = db.DocumentType;
const Dictionary = db.Dictionary;
const Audit = db.Audit;

const documentFields = `filename
parse.documentDate
parse.documentType
parse.documentNumber
user
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
      let document = {
        filename: d.filename,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        _id: d._id
      };
      if (d.analysis && d.analysis.attributes) {
        if (d.user) {
          document.user = d.user;
        } else {
          document.analysis = d.analysis;
        }
      }
      return document;
    });

    res.status(200).json(documents);
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
      logger.log(req, res, 'Просмотр документа');

      let audit = await Audit.findOne(
        { _id: document.auditId },
        `subsidiary.name auditStart auditEnd status -_id`
      ).lean();

      if (audit) {
        audit.subsidiaryName = audit.subsidiary.name;
        delete audit.subsidiary;

        document.documentDate = document.parse.documentDate;
        document.documentType = document.parse.documentType;
        document.documentNumber = document.parse.documentNumber;
        document.audit = audit;
        delete document.parse;
        delete document.auditId;

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
  let document = await Document.findOne({ _id: req.query._id });
  if (!document) {
    let err = 'Document not found';
    logger.logError(req, res, err, 404);
    return;
  }

  document.user.attributes = req.body.user;
  document.user.author = req.session.message;
  document.user.updateDate = new Date();

  try {
    await document.save();
    logger.log(req, res, 'Изменение документа');
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
  try {
    let documentType = await DocumentType.findOne({
      _id: req.query.name
    }).lean();
    if (documentType) {
      let attributes = documentType.attributes;
      for (let attribute of attributes) {
        if (attribute.dictionaryName) {
          let dictionary = await Dictionary.findOne({
            _id: attribute.dictionaryName
          }).lean();
          if (dictionary) {
            attribute.values = dictionary.values;
          }
        }
      }
      res.status(200).json(attributes);
    } else {
      let err = `Can not find document type with name ${req.query.name}`;
      logger.logError(req, res, err, 404);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocumentTypes = async (req, res) => {
  try {
    let documentTypes = await DocumentType.find();
    res.status(200).json(documentTypes);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
