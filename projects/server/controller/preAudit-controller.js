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
      { 'analysis.attributes': { $exists: true } },
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
      audit.typeViewResult = 3;
    } else {
      audit.typeViewResult = checks.length;
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
exports.getBookValueRelevance = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    let bookValues = await BookValue.find().lean();
    bookValues = bookValues.filter(
      bookValue =>
        bookValue.date.getMonth() === month &&
        bookValue.date.getFullYear() === year
    );
    const relevant = bookValues.length === 1;
    res.send({ relevant });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

//Получение информации об актуальности списка аффилированных лиц
exports.getAffiliatesListRelevance = async (req, res) => {
  try {
    let catalog = await Catalog.findOne().lean();

    //Вычисляем текущий квартал
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.floor((currentMonth + 2) / 3);

    const relevant = catalog.affiliatesListQuarter === currentQuarter;

    res.send({ relevant });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
