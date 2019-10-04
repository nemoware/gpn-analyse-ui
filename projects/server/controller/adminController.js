const User = require('../config/db.config').User;
const Role = require('../config/db.config').Role;
const logger = require('../core/logger');
const adAuth = require('../config/app.config').ad.auth;

exports.getApplicationUsers = async (req, res) => {
  User.find({}, async (err, users) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    let _users = JSON.parse(JSON.stringify(users));
    for (let user of _users) {
      user.name = await getUserName(user.login);
    }
    res.status(200).json(_users);
  });
};

exports.getGroupUsers = async (req, res) => {
  try {
    let users = await adAuth.getGroupUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: 'error', details: err });
    console.log(err);
    logger.logError(req, res, err);
  }
};

exports.getUserInfo = (req, res) => {
  User.findOne({ login: req.session.message }, async (err, user) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    user = user.toJSON();
    let groupUsers = await adAuth.getGroupUsers();
    for (let u of groupUsers) {
      if (user.login === u.sAMAccountName) {
        user.name = u.displayName;
      }
    }
    res.status(200).json(user);
  });
};

exports.getRoles = async (req, res) => {
  Role.find({}, (err, roles) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(roles);
  });
};

exports.postUser = async (req, res) => {
  let user = new User(req.body);
  user.save(async err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
    user = user.toJSON();
    user.name = await getUserName(user.login);

    logger.log(req, res, 'Добавление пользователя');
    res.status(201).json(user);
  });
};

exports.deleteUser = (req, res) => {
  if (req.query.id == null) {
    let msg = 'Cannot delete user because id is null';
    res.status(400).json({ msg: 'error', details: 'id is null' });
    console.log(msg);
    logger.logError(req, res, msg);
    return;
  }
  User.deleteOne({ _id: req.query.id }, err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    logger.log(req, res, 'Удаление пользователя');
    res.status(200).send();
  });
};

exports.updateUser = async (req, res) => {
  let user = await User.findOne({ _id: req.body._id });
  if (user === null) {
    let err = 'user not found';
    res.status(400).json({ msg: 'error', details: 'user not found' });
    console.log(err);
    logger.logError(req, res, err);
    return;
  }
  user.roles = req.body.roles;
  user.save(async err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
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
