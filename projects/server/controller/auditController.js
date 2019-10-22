const logger = require('../core/logger');
const db = require('../config/db.config');
const Audit = db.Audit;
const Document = db.Document;
const Subsidiary = db.Subsidiary;
const User = db.User;
const parser = require('../parser/auditParser');

exports.postAudit = async (req, res) => {
  let audit = new Audit(req.body);
  audit.status = 'New';
  audit.author = req.session.message;

  audit.save(err => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }
    logger.log(req, res, 'Создание аудита');
    res.status(201).json(audit);

    parser.parseAudit(audit);
  });
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
