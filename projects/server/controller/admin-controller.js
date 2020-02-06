const roles = require('../json/role');
const logger = require('../core/logger');
const adService = require('../services/ad-service');
const { User, Group } = require('../models');

exports.getUserInfo = async (req, res) => {
  const user = res.locals.user.sAMAccountName;
  user.name = await adService.getUserName(user.login);
  logger.log(req, res, 'Вход в приложение');
  res.status(200).json(user);
};

exports.getADGroups = async (req, res) => {
  try {
    const groups = await adService.getGroups(req.query.filter);
    res.send(groups);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAppGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.send(groups);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postGroup = async (req, res) => {
  try {
    const groups = await Group.find();
    res.send(groups);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getRoles = async (req, res) => {
  res.send(roles);
};
