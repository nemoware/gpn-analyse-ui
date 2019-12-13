const fs = require('fs-promise');
const logger = require('../core/logger');
const db = require('../config/db.config');
const Audit = db.Audit;
const Document = db.Document;
const subsidiaries = require('../json/subsidiary');
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
  res.send(
    subsidiaries.map(s => {
      return {
        name: s._id
      };
    })
  );
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

  try {
    let audits = await Audit.find(where, null, { lean: true });

    audits = audits.map(a => {
      a.subsidiaryName = a.subsidiary.name;
      a.sortDate = new Date(
        Math.max(a.createDate.getTime(), a.auditEnd.getTime())
      );
      return a;
    });

    const checks = [
      { 'analysis.attributes': { $exists: true } },
      { parserResponseCode: 200 }
    ];
    for (let audit of audits) {
      audit.typeViewResult = checks.length;
      for (let check of checks) {
        check.auditId = audit._id;
        if (await Document.findOne(check)) {
          break;
        }
        audit.typeViewResult--;
      }
    }

    audits.sort((a, b) => b.sortDate - a.sortDate);

    res.send(audits);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
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
    const auditId = req.query.auditId;
    if (!auditId) {
      logger.logError(
        req,
        res,
        'Can not get files because auditId is null',
        400
      );
      return;
    }
    const audit = await Audit.findOne({ _id: auditId });

    if (!audit) {
      logger.logError(req, res, `Can not find audit with id ${auditId}`, 404);
      return;
    }

    let filePaths, fileObjects, errors;

    if (audit.status === 'New' || audit.status === 'Loading') {
      filePaths = await parser.getPaths(audit.ftpUrl);
    } else {
      filePaths = await Document.find({ auditId: auditId }).distinct(
        'filename'
      );
      errors = await Document.find(
        { auditId: auditId, parserResponseCode: { $ne: 200 } },
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

exports.parse = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot update audit because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  let auditId = req.query.id;
  try {
    let audit = await Audit.findOne({ _id: auditId });

    if (!audit) {
      let msg = `Cannot find audit with id ${auditId}`;
      logger.logError(req, res, msg, 404);
      return;
    }

    audit.status = 'Loading';
    await audit.save();

    res.status(200).send();

    let documents = await Document.find({
      auditId: auditId,
      parserResponseCode: { $ne: 200 }
    });

    for (let document of documents) {
      let filename = document.filename;
      await parser.parse(audit.ftpUrl, filename, audit);
      await Document.deleteOne({ _id: document._id });
    }

    await parser.setParseStatus(audit);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getViolations = async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send('Required parameter `id` is not passed');
  }

  const audit = await Audit.findById(req.query.id, `violations`).lean();
  const violations = audit.violations;

  res.send(violations);
};

exports.approve = async (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).send(`Required parameter 'id' is not passed`);
  }

  try {
    const audit = await Audit.findById(id);
    if (!audit) {
      return res.status(404).send(`No audit found with id = ${id}`);
    }

    if (audit.status !== 'Done') {
      return res
        .status(400)
        .send(`Cannot approve audit with status = ${audit.status}`);
    }

    audit.status = 'Approved';
    await audit.save();
    res.end();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
