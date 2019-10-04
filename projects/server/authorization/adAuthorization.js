const kerberos = require('kerberos');
const ActiveDirectory = require('activedirectory');
const appConfig = require('../config/app.config');
const ad = new ActiveDirectory(appConfig.ad);
const fs = require('fs');

exports.getUser = async (req, res) => {
  return new Promise((resolve, reject) => {
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
  });
};

exports.getGroupUsers = async () => {
  return new Promise((resolve, reject) => {
    ad.findUser(login, function(err, user) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(contents);
        return user.displayName;
      }
    });
  });
};

exports.getUserName = async login => {
  ad.findUser(login, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      return user.displayName;
    }
  });
};
