const Audit = require('../config/db.config').Audit;
const AuditStatus = require('../config/db.config').AuditStatus;
const Subsidiary = require('../config/db.config').Subsidiary;
const logger = require('../core/logger');

exports.postAudit = async (req, res) => {
  let status = {
    date: new Date(),
    status: await AuditStatus.findOne({ name: 'Новый' }).lean(),
    comment: null
  };

  let audit = new Audit(req.body);
  audit.statuses.push(status);

  //todo
  audit.author = {
    login: 'user',
    name: 'user'
  };

  audit.save(err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(201).json(audit);
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

exports.getAuditStatuses = async (req, res) => {
  AuditStatus.find({}, (err, statuses) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(statuses);
  });
};

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

exports.postAuditStatus = async (req, res) => {
  let status = new AuditStatus(req.body);
  status.save(err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(201).json(status);
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
