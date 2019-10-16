const logger = require('../core/logger');
const db = require('../config/db.config');
const Audit = db.Audit;
const Subsidiary = db.Subsidiary;
const User = db.User;
const parser = require('../parser/auditParser');

exports.postAudit = async (req, res) => {
  let audit = new Audit(req.body);
  audit.status = 'New';
  audit.author = await User.findOne({ login: req.session.message });

  audit.save(err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
    logger.log(req, res, 'Создание аудита');
    res.status(201).json(audit);
    parser.parseAudit(audit._id);
  });
};

exports.getSubsidiaries = async (req, res) => {
  Subsidiary.find({}, (err, subsidiaries) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(subsidiaries);
  });
};

/*exports.getAuditStatuses = async (req, res) => {
  AuditStatus.find({}, (err, statuses) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(statuses);
  });
};*/

exports.getAudits = async (req, res) => {
  let where = {};

  if (req.query.name != null) {
    where['subsidiary.name'] = {
      $regex: `.*${req.query.name}.*`,
      $options: 'i'
    };
  }

  Audit.find(where, (err, audits) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(audits);
  });
};

exports.postSubsidiary = async (req, res) => {
  let subsidiary = new Subsidiary(req.body);
  subsidiary.save(err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(201).json(subsidiary);
  });
};

exports.deleteAudit = async (req, res) => {
  if (req.query.id == null) {
    let msg = 'Cannot delete audit because id is null';
    res.status(400).json({ msg: 'error', details: 'id is null' });
    console.log(msg);
    logger.logError(req, res, msg);
    return;
  }
  Audit.deleteOne({ _id: req.query.id }, err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
    res.status(200).send();
  });
};
