const db = require('../config/db.config');
const logger = require('../core/logger');
const Document = db.Document;

exports.getDocuments = async (req, res) => {
  if (!req.query.auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let exclude;
    if (req.query.full === 'false') {
      exclude = `-auditId
      -paragraphs
      -analysis.original_text
      -analysis.normal_text
      -analysis.import_timestamp
      -analysis.analyze_timestamp
      -analysis.tokenization_maps
      -analysis.checksum`;
    }

    let documents = await Document.find(
      { auditId: req.query.auditId },
      exclude
    );

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
      { _id: req.query.id },
      '-paragraphs'
    ).lean();

    if (document) {
      logger.log(req, res, 'Просмотр документа');
      if (document.user) {
        delete document.analysis.attributes;
      }
      res.status(200).json(document);
    } else {
      let err = `Can not find document with id ${req.query.id}`;
      logger.logError(req, res, err, 404);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateDocument = async (req, res) => {
  let document = await Document.findOne({ _id: req.body._id });
  if (!document) {
    let err = 'Document not found';
    logger.logError(req, res, err, 404);
    return;
  }

  document.user = req.body.user;
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
