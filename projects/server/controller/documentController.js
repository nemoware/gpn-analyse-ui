const db = require('../config/db.config');
const logger = require('../core/logger');
const Document = db.Document;
const Audit = db.Audit;

exports.getDocuments = async (req, res) => {
  if (req.query.auditId == null) {
    let err = 'Can not find documents: auditId is null';
    res.status(400).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
    return;
  }

  try {
    let documents = await Document.find({ auditId: req.query.auditId });
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
  }
};
