const roles = require('../json/role');
const logger = require('../core/logger');
const adAuth = require('../config/app.config').ad.auth;
const User = require('../config/db.config').User;

exports.getApplicationUsers = async (req, res) => {
  try {
    let users = await User.find({}, null, { lean: true });
    for (let i = 0; i < users.length; i++) {
      try {
        users[i].name = await getUserName(users[i].login);
        users[i].roleString = users[i].roles.map(r => r.name).join(', ');
      } catch (err) {
        let silent;
        if (err.code === 'NOADUSER') {
          users.splice(i--, 1);
          silent = true;
        }
        logger.logError(req, res, err, 500, silent);
      }
    }

    res.status(200).json(users);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getGroupUsers = async (req, res) => {
  try {
    let users = await adAuth.getGroupUsers();
    if (req.query.value) {
      const filter = req.query.value.toLowerCase().trim();
      let names = users.filter(
        u =>
          ~u.displayName
            .toLowerCase()
            .trim()
            .indexOf(filter)
      );
      let logins = users.filter(
        u =>
          ~u.sAMAccountName
            .toLowerCase()
            .trim()
            .indexOf(filter)
      );
      const set = new Set(names.concat(logins));
      users = Array.from(set);
    }
    res.status(200).json(Array.from(users));
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getUserInfo = async (req, res) => {
  const user = res.locals.user;
  user.name = await getUserName(user.login);
  logger.log(req, res, 'Вход в приложение');
  res.status(200).json(user);
};

exports.getRoles = async (req, res) => {
  res.send(roles);
};

exports.postUser = async (req, res) => {
  try {
    let user = new User(req.body);
    let userName = await getUserName(user.login);
    await user.save();

    user = user.toJSON();
    user.name = userName;
    user.roleString = user.roles.map(r => r.name).join(', ');

    logger.log(req, res, 'Добавление пользователя');
    res.status(201).json(user);
  } catch (err) {
    let status = 500;
    if (err.code === 'NOADUSER') status = 400;
    logger.logError(req, res, err, status);
  }
};

exports.deleteUser = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete user because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }
  try {
    await User.deleteOne({ _id: req.query.id });
    logger.log(req, res, 'Удаление пользователя');
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateUser = async (req, res) => {
  let user = await User.findOne({ _id: req.body._id });
  if (!user) {
    let err = `Can not find user with id ${req.body._id}`;
    logger.logError(req, res, err, 404);
    return;
  }

  const userRoles = req.body.roles;
  if (userRoles.find(r => +r._id === 3) && userRoles.length > 1) {
    return res
      .status(400)
      .send('User with administrator privileges cannot view events or audits');
  }

  user.roles = userRoles;
  try {
    await user.save();

    user = user.toJSON();
    user.name = await getUserName(user.login);
    user.roleString = user.roles.map(r => r.name).join(', ');

    logger.log(req, res, 'Изменение прав пользователя');
    res.status(200).json(user);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

async function getUserName(login) {
  const users = await adAuth.getGroupUsers();
  const user = users.find(u => u.sAMAccountName === login);
  if (!user) {
    let err = new Error(`There is no user in AD with sAMAccountName ${login}`);
    err.code = 'NOADUSER';
    throw err;
  }
  return user.displayName;
}
