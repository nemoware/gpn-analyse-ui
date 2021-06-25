const { LimitValue, Risk, BookValue, AffiliatesList } = require('../models');
const logger = require('../core/logger');
const catalog = require('../json/catalog.json');
const parser = require('../services/parser-service');
exports.getRisks = async (req, res) => {
  try {
    let riskMatrix = await Risk.find().lean();
    res.send(riskMatrix);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postRisk = async (req, res) => {
  let risk = new Risk(req.body);

  try {
    await risk.save();
    await logger.log(req, res, 'Добавление риска');
    res.status(201).json(risk);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.deleteRisk = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete risk because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  let riskId = req.query.id;
  try {
    await Risk.deleteOne({ _id: riskId });
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateRisk = async (req, res) => {
  const id = req.body._id;

  try {
    const risk = await Risk.findById(id);
    if (!risk) return res.status(404).send(`No risk found with id = ${id}`);

    risk.violation = req.body.violation;
    risk.subject = req.body.subject;
    risk.risk = req.body.risk;
    risk.recommendation = req.body.recommendation;
    risk.disadvantage = req.body.disadvantage;

    await risk.save();
    await logger.log(req, res, 'Редактирование риска');
    res.send(risk);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getLimitValues = async (req, res) => {
  try {
    let limitValues = await LimitValue.find().lean();
    res.send(limitValues);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postLimitValue = async (req, res) => {
  let limitValue = new LimitValue(req.body);

  try {
    await limitValue.save();
    await logger.log(req, res, 'Добавление предельных значений');
    res.status(201).json(limitValue);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.deleteLimitValue = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete limit value because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  let limitValueId = req.query.id;
  try {
    await LimitValue.deleteOne({ _id: limitValueId });
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateLimitValue = async (req, res) => {
  const id = { _id: req.body._id };

  try {
    let limitValue = await LimitValue.findOneAndUpdate(id, req.body, {
      new: true
    });
    // if (!limitValue) return res.status(404).send(`No limit value found with id = ${id}`);
    //
    // limitValue = new LimitValue(req.body);
    //
    // await limitValue.save();
    await logger.log(req, res, 'Редактирование предельных значений');
    res.send(limitValue);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getViolationTypes = async (req, res) => {
  try {
    let violations = catalog.violationTypes;
    res.send(violations);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getBookValues = async (req, res) => {
  try {
    let bookValues = await BookValue.find().lean();
    res.send(bookValues);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postBookValue = async (req, res) => {
  let bookValue = new BookValue(req.body);

  try {
    await bookValue.save();
    await logger.log(req, res, 'Добавление Балансовой стоимости');
    res.status(201).json(bookValue);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.deleteBookValue = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete bookValue because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  let bookValueID = req.query.id;
  try {
    await BookValue.deleteOne({ _id: bookValueID });
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateBookValue = async (req, res) => {
  const id = req.body._id;
  console.log(req.body);
  try {
    const bookValue = await BookValue.findById(id);
    if (!bookValue) {
      let err = `No bookValue found with id = ${id}`;
      logger.logError(req, res, err, 404);
    }

    bookValue.date = req.body.date;
    bookValue.value = req.body.value;

    await bookValue.save();
    await logger.log(req, res, 'Редактирование балансовой стоимости');
    res.send(bookValue);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.saveAffiliatesList = async (req, res) => {
  const base64Content = req.body.base64Content;
  try {
    const response = await parser.exportAffiliatesList(base64Content);
    const stakeholders = response.stakeholders.map(stakeholder => {
      stakeholder.company = 'gp';
      return stakeholder;
    });
    AffiliatesList.deleteMany().then(() => {
      AffiliatesList.insertMany(stakeholders).then(() => {
        //Ждем пока все запишется в базу, потом отправляем уведомление об успешной записи
        res.status(201).json();
      });
    });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.fetchAffiliates = async (req, res) => {
  try {
    let sort;
    const column = req.query.column;
    if (req.query.column) {
      sort = {
        [column]: req.query.sort === 'asc' ? 1 : -1
      };
    }
    let count;
    let affiliates;
    const where = [];
    //Если нет фильтра по имени - ищем все
    const name = req.query.name;
    if (name) {
      where.push({
        name: {
          $regex: `.*${name}.*`,
          $options: 'i'
        }
      });
      count = await AffiliatesList.countDocuments({ $and: where });
      affiliates = await AffiliatesList.find({ $and: where })
        .lean()
        .setOptions({
          skip: +req.query.skip,
          limit: +req.query.take,
          sort
        });
    } else {
      count = await AffiliatesList.countDocuments();
      affiliates = await AffiliatesList.find()
        .lean()
        .setOptions({
          skip: +req.query.skip,
          limit: +req.query.take,
          sort
        });
    }
    res.send({ count, affiliates });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
