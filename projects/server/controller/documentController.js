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
    let documents = await Document.find({ auditId: req.query.auditId });

    let full;
    if (req.query.full == null) {
      full = true;
    } else {
      full = req.query.full === 'true';
    }

    if (!full) {
      documents = JSON.parse(JSON.stringify(documents));
      for (let document of documents) {
        delete document['auditId'];
        delete document['paragraphs'];
        if (document.analysis != null) {
          delete document.analysis['original_text'];
          delete document.analysis['normal_text'];
          delete document.analysis['import_timestamp'];
          delete document.analysis['analyze_timestamp'];
          delete document.analysis['tokenization_maps'];
          delete document.analysis['checksum'];
        }
      }
    }
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
  }
};
