const logger = require('../core/logger');
const adAuth = require('../config/app.config').ad.auth;
const db = require('../config/db.config');
const User = db.User;
const Role = db.Role;

exports.getApplicationUsers = async (req, res) => {
  try {
    let users = await User.find({}, null, { lean: true });
    for (let user of users) {
      user.name = await getUserName(user.login);
    }

    res.status(200).json(users);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getGroupUsers = async (req, res) => {
  try {
    let users = await adAuth.getGroupUsers();
    res.status(200).json(users);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getUserInfo = async (req, res) => {
  let user = req.session.message;
  let groupUsers = await adAuth.getGroupUsers();
  for (let u of groupUsers) {
    if (user.login === u.sAMAccountName) {
      user.name = u.displayName;
    }
  }

  logger.log(req, res, 'Вход в приложение');
  res.status(200).json(user);
};

exports.getRoles = async (req, res) => {
  Role.find({}, (err, roles) => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    res.status(200).json(roles);
  });
};

exports.postUser = async (req, res) => {
  let user = new User(req.body);
  user.save(async err => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }
    user = user.toJSON();
    user.name = await getUserName(user.login);

    logger.log(req, res, 'Добавление пользователя');
    res.status(201).json(user);
  });
};

exports.deleteUser = (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete user because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }
  User.deleteOne({ _id: req.query.id }, err => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    logger.log(req, res, 'Удаление пользователя');
    res.status(200).send();
  });
};

exports.updateUser = async (req, res) => {
  let user = await User.findOne({ _id: req.body._id });
  if (!user) {
    let err = 'user not found';
    logger.logError(req, res, err, 404);
    return;
  }
  user.roles = req.body.roles;
  user.save(async err => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }

    user = user.toJSON();
    user.name = await getUserName(user.login);

    logger.log(req, res, 'Изменение прав пользователя');
    res.status(200).json(user);
  });
};

async function getUserName(login) {
  let groupUsers = await adAuth.getGroupUsers();
  for (let u of groupUsers) {
    if (login === u.sAMAccountName) {
      return u.displayName;
    }
  }
}
