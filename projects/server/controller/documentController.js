const db = require('../config/db.config');
const logger = require('../core/logger');
const Document = db.Document;

exports.getDocuments = async (req, res) => {
  if (req.query.auditId == null) {
    let err = 'Can not find documents: auditId is null';
    res.status(400).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
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
    res.status(500).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
  }
};
