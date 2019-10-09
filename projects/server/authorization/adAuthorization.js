const kerberos = require('kerberos');
const ActiveDirectory = require('activedirectory');
const fs = require('fs');
const appConfig = require('../config/app.config');

const ad = new ActiveDirectory(appConfig.ad);

exports.getLogin = async (req, res) => {
  return new Promise((resolve, reject) => {
    if (appConfig.ad.on) {
      if (!req.headers.authorization) {
        res.set('WWW-Authenticate', 'Negotiate');
        res.status(401).send();
      } else {
        let ticket = req.headers.authorization.substring('Negotiate '.length);
        kerberos.initializeServer('HTTP@bm-dev', (err, server) => {
          if (err) {
            console.log(err);
          } else {
            server.step(ticket, function(err, context) {
              if (err) {
                console.log(err);
              } else {
                ad.findUser(server.username, function(err, user) {
                  if (err) {
                    console.log(err);
                  } else {
                    resolve(user);
                  }
                });
              }
            });
          }
        });
      }
    } else {
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
    }
  });
};
