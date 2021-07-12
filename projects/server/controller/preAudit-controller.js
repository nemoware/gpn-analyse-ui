const logger = require('../core/logger');
const { Audit, Document, BookValue, Catalog } = require('../models');
const roboService = require('../services/robo-service');
exports.fetchPreAudits = async (req, res) => {
  try {
    let sort;
    if (req.query.column) {
      sort = {
        [req.query.column]: req.query.sort === 'asc' ? 1 : -1
      };
    }
    const where = [];

    const checkTypes = req.query.checkTypes;
    const auditStatuses = req.query.auditStatuses;
    const createDate = req.query.createDate;

    where.push({ 'pre-check': { $exists: true } });

    if (checkTypes) {
      where.push({ checkTypes: { $in: checkTypes.split(',') } });
    }

    if (auditStatuses) {
      where.push({ status: { $in: auditStatuses.split(',') } });
    }

    if (createDate) {
      const dateTo = toDate(createDate);
      dateTo.setDate(dateTo.getDate() + 1);
      where.push({
        $and: [
          { createDate: { $lt: dateTo } },
          { createDate: { $gte: toDate(createDate) } }
        ]
      });
    }
    let count;
    let audits;
    count = await Audit.countDocuments({ $and: where });
    audits = await Audit.find({ $and: where })
      .lean()
      .setOptions({
        skip: +req.query.skip,
        limit: +req.query.take,
        sort
      });

    audits = await Promise.all(
      audits.map(async a => {
        a.authorName = a.author && a.author.name;
        a.fileNames = await getFiles(a);
        return a;
      })
    );

    res.send({ count, audits });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.uploadFiles = async (req, res) => {
  try {
    const author = res.locals.user;
    await roboService.postFiles(
      req.body.checkTypes,
      req.body.documents,
      author
    );
    res.status(201).json();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
toDate = s => {
  const parts = s.split('.');
  return new Date(parts[2], parts[1] - 1, parts[0], 3);
};

getFiles = async audit => {
  const auditId = audit._id;
  return await Document.find({
    $or: [{ auditId }, { _id: { $in: audit.charters } }]
  }).distinct('filename');
};

exports.getPreAudits = async (req, res) => {
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

    const checks = [
      { 'analysis.attributes_tree': { $exists: true } },
      { parserResponseCode: 200 }
    ];

    if (
      req.query.id &&
      audits[0] &&
      ['Finalizing', 'Done', 'Approved'].includes(audits[0].status)
    ) {
      audits[0].typeViewResult = 4;
    } else {
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
    }
    audits.sort((a, b) => b.sortDate - a.sortDate);

    res.send(audits);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getPreAudit = async (req, res) => {
  let where = {};

  if (req.query.id) {
    where['_id'] = req.query.id;
  }

  try {
    let audit = await Audit.findOne(where, null, { lean: true });

    const checks = [
      { 'analysis.attributes_tree': { $exists: true } },
      { parserResponseCode: 200 }
    ];

    if (
      req.query.id &&
      audit &&
      ['Finalizing', 'Done', 'Approved'].includes(audit.status)
    ) {
      audit.typeViewResult = 2;
    } else {
      audit.typeViewResult = 1;
      for (let check of checks) {
        check.auditId = audit._id;
        if (await Document.findOne(check)) {
          break;
        }
        audit.typeViewResult--;
      }
    }

    res.send(audit);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

//Получение информации об актуальности балансовой стоимости
getBookValueRelevance = async () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  let bookValues = await BookValue.find().lean();
  bookValues = bookValues.filter(
    bookValue =>
      bookValue.date.getMonth() === month &&
      bookValue.date.getFullYear() === year
  );
  return bookValues.length === 1;
};

//Получение информации об актуальности списка аффилированных лиц
getAffiliatesListRelevance = async () => {
  let catalog = await Catalog.findOne().lean();

  //Вычисляем текущий квартал
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.floor((currentMonth + 2) / 3);

  return catalog.affiliatesListQuarter === currentQuarter;
};

//Получение информации об актуальности справочников для аудита
exports.getPreAuditRelevance = async (req, res) => {
  try {
    const bookValueRelevance = await getBookValueRelevance();
    const affiliatesListReference = await getAffiliatesListRelevance();
    res.send({
      bookValueRelevance,
      affiliatesListReference
    });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocuments = async (req, res) => {
  const auditId = req.query.auditId;
  if (!auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let documents = await Document.find(
      {
        auditId,
        parserResponseCode: 200
      },
      `analysis.attributes_tree analysis.analyze_timestamp user.attributes_tree filename state documentType`,
      { lean: true }
    );

    documents = documents.map(d => {
      if (d.user?.attributes_tree) {
        d.attributes_tree = d.user?.attributes_tree;
      } else {
        d.attributes_tree = d.analysis?.attributes_tree;
      }
      return d;
    });

    res.send(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getViolations = async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send('Required parameter `id` is not passed');
  }

  try {
    const audit = await Audit.findById(req.query.id, `violations`).lean();
    let violations = audit.violations;
    res.send(violations);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
