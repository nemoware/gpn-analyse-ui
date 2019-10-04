const User = require('../config/db.config').User;
const Role = require('../config/db.config').Role;
const logger = require('../core/logger');
const appConfig = require('../config/app.config');
const adAuth = appConfig.ad.auth;

exports.getApplicationUsers = async (req, res) => {
  User.find({}, async (err, users) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    let groupUsers = await adAuth.getGroupUsers();
    let _users = JSON.parse(JSON.stringify(users));
    for (let user of _users) {
      for (let u of groupUsers) {
        if (user.login === u.sAMAccountName) {
          user.name = u.displayName;
        }
      }
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

exports.getUserInfo = (req, res) => {};

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
  user.save(err => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

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
    res.status(200).send();
  });
};
