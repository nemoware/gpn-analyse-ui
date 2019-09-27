const Audit = require('../config/db.config').Audit;
const AuditStatus = require('../config/db.config').AuditStatus;
const Company = require('../config/db.config').Company;

exports.postAudit = async (req, res) => {
  let status = {
    date: new Date(),
    status: await AuditStatus.findOne({ name: 'Новый' }).lean(),
    comment: null
  };

  let audit = new Audit(req.body);
  audit.statuses.push(status);

  audit.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(201).json(audit);
  });
};

exports.getCompanies = async (req, res) => {
  Company.find({}, function(err, companies) {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(200).json(companies);
  });
};

exports.getAuditStatuses = async (req, res) => {
  AuditStatus.find({}, function(err, statuses) {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(200).json(statuses);
  });
};

exports.getAudits = async (req, res) => {
  Audit.find({}, function(err, audits) {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(200).json(audits);
  });
};

exports.postAuditStatus = async (req, res) => {
  let status = new AuditStatus(req.body);
  status.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(201).json(status);
  });
};

exports.postCompany = async (req, res) => {
  let company = new Company(req.body);
  company.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }

    res.status(201).json(company);
  });
};
