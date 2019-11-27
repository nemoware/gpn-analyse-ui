const appConfig = require('../config/app.config');
const users = require('../json/fakeUser');

exports.getUser = async (req, res) => {
  for (let user of users) {
    if (user.sAMAccountName === appConfig.ad.login) {
      return user;
    }
  }

  throw `There is no user with login ${appConfig.ad.login} in AD`;
};

exports.getUserName = async login => {
  for (let user of users) {
    if (user.sAMAccountName === login) {
      return user.displayName;
    }
  }
};

exports.getGroupUsers = async () => {
  return users;
};
