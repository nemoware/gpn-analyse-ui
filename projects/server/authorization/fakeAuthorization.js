const fs = require('fs');
const appConfig = require('../config/app.config');

exports.getUser = async (req, res) => {
  return new Promise((resolve, reject) => {
    fs.readFile('./json/fakeUser.json', 'utf8', async (err, data) => {
      if (err) throw err;
      let users = JSON.parse(data);
      for (let user of users) {
        if (user.sAMAccountName === appConfig.ad.login) {
          resolve(user);
          return;
        }
      }
    });
  });
};

exports.getUserName = login => {
  return new Promise((resolve, reject) => {
    fs.readFile('./json/fakeUser.json', 'utf8', (err, data) => {
      if (err) throw err;
      let users = JSON.parse(data);
      for (let user of users) {
        if (user.sAMAccountName === login) {
          resolve(user.displayName);
        }
      }
    });
  });
};
