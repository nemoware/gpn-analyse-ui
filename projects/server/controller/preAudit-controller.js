const logger = require('../core/logger');
const { Audit } = require('../models');
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

    const checkType = req.query.checkType;

    where.push({ 'pre-check': { $exists: true } });

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

    audits = audits.map(a => {
      a.authorName = a.author && a.author.name;
      const roles = a.author && a.author.roles;
      a.checkType = [];
      roles.forEach(role => {
        if (role._id === 4 || role._id === 5 || role._id === 6) {
          switch (role._id) {
            case 4:
              a.checkType.push('InsiderControl');
              break;
            case 5:
              a.checkType.push('InterestControl');
              break;
            case 6:
              a.checkType.push('ProjectControl');
              break;
          }
        }
      });
      a.files = 'Файлики';
      return a;
    });

    res.send({ count, audits });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.uploadFiles = async (req, res) => {
  try {
    const author = res.locals.user;
    await roboService.postFiles(req.body, author);
    res.status(201).json();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
