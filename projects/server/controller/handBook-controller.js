const { Risk } = require('../models');
const logger = require('../core/logger');

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
