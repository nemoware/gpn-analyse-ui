const User = require('../config/db.config').User;
const Role = require('../config/db.config').Role;
const logger = require('../core/logger');

exports.getUsers = async (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }

    res.status(200).json(users);
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
