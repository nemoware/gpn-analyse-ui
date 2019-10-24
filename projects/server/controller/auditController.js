const fs = require('fs-promise');
const logger = require('../core/logger');
const db = require('../config/db.config');
const Audit = db.Audit;
const Document = db.Document;
const Subsidiary = db.Subsidiary;
const parser = require('../parser/auditParser');

exports.postAudit = async (req, res) => {
  let audit = new Audit(req.body);
  audit.status = 'New';
  audit.author = req.session.message;

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
    logger.log(req, res, 'Создание аудита');
    res.status(201).json(audit);

    parser.parseAudit(audit);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getSubsidiaries = async (req, res) => {
  Subsidiary.find({}, (err, subsidiaries) => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    res.status(200).json(subsidiaries);
  });
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

  Audit.find(where, (err, audits) => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    res.status(200).json(audits);
  });
};

exports.postSubsidiary = async (req, res) => {
  let subsidiary = new Subsidiary(req.body);
  subsidiary.save(err => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    res.status(201).json(subsidiary);
  });
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
    if (!req.query.auditId) {
      logger.logError(
        req,
        res,
        'Can not get files because auditId is null',
        400
      );
      return;
    }
    const audit = await Audit.findOne({ _id: req.query.auditId });

    if (!audit) {
      logger.logError(
        req,
        res,
        `Can not find audit with id ${req.query.auditId}`,
        404
      );
      return;
    }

    let filePaths, fileObjects, errors;

    if (audit.status === 'New' || audit.status === 'Loading') {
      filePaths = await parser.getPaths(audit.ftpUrl);
    } else {
      filePaths = await Document.find({ auditId: req.query.auditId }).distinct(
        'filename'
      );
      errors = await Document.find(
        { 'parse.documentType': { $exists: false } },
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
