const User = require('../config/db.config').User;
const Role = require('../config/db.config').Role;
const logger = require('../core/logger');
const adminController = require('../authorization/adAuthorization');

exports.getUsers = async (req, res) => {
  User.find({}, async (err, users) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    let usersGroup = await adminController.getUserGroup();
    var _users = JSON.parse(JSON.stringify(users));
    for (let user of _users) {
      for (let u of usersGroup) {
        if (user.login === u.sAMAccountName) {
          user.name = u.displayName;
        }
      }
    }
    res.status(200).json(_users);
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
