const logger = require('../core/logger');

exports.getUserInfo = async (req, res) => {
  await logger.log(req, res, 'Вход в приложение');
  res.send(res.locals.user);
};

exports.getRobotState = (req, res) => {
  res.send({ state: global.robot });
};
