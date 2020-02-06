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

exports.getRoles = async (req, res) => {
  res.send(roles);
};
