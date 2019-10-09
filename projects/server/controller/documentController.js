const db = require('../config/db.config');
const Document = db.Document;

exports.getDocuments = async (req, res) => {
  let where = {};
  if (req.query.auditId != null) {
    where.auditId = req.query.auditId;
  }
  try {
    let documents = await Document.find(where);
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
  }
};
