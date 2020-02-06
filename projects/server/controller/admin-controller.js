const roles = require('../json/role');
const logger = require('../core/logger');
const adService = require('../services/ad-service');
const User = require('../config/db').User;

exports.getUserInfo = async (req, res) => {
  const user = res.locals.user;
  user.name = await adService.getUserName(user.login);
  logger.log(req, res, 'Вход в приложение');
  res.status(200).json(user);
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await adService.getGroups(req.query.filter);
    res.send(groups);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getRoles = async (req, res) => {
  res.send(roles);
};