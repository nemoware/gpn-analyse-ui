const fs = require('fs-promise');
const appConfig = require('../config/app.config');

exports.getUser = async (req, res) => {
  const data = await fs.readFile('./json/fakeUser.json', 'utf8');
  let users = JSON.parse(data);
  for (let user of users) {
    if (user.sAMAccountName === appConfig.ad.login) {
      return user;
    }
  }

  throw `There is no user with login ${appConfig.ad.login} in AD`;
};

exports.getUserName = async login => {
  const data = await fs.readFile('./json/fakeUser.json', 'utf8');
  let users = JSON.parse(data);
  for (let user of users) {
    if (user.sAMAccountName === login) {
      return user.displayName;
    }
  }
};

exports.getGroupUsers = async () => {
  const data = await fs.readFile('./json/fakeUser.json', 'utf8');
  return JSON.parse(data);
};
