const logger = require('../core/logger');
const { Audit, Document } = require('../models');
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
        a.checkType = ['В базе пока что этого нет'];
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
