const kerberos = require('kerberos');
const ad_conf = require('../config/app.config');

const ActiveDirectory = require('activedirectory');
var ad = new ActiveDirectory(ad_conf.ad);

exports.get_login = async (req, res) => {

  return new Promise((resolve, reject) => {

    if (!req.headers.authorization) {

      res.set('WWW-Authenticate', 'Negotiate');
      res.status(401).send();

    } else {

      var ticket = req.headers.authorization.substring("Negotiate ".length);
      kerberos.initializeServer("HTTP@bm-dev", (err, server) => {
        if (err) {
          console.log(err);
        } else {
          server.step(ticket, function (err, context) {
            if (err) {
              console.log(err);
            } else {
              ad.findUser(server.username, function (err, user) {
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

exports.get_users = async (req, res) => {
  ad.getUsersForGroup(ad_conf.group_name, function(err, users) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err));
      return;
    }
    if (!users)
      console.log('Group: ' + ad_conf.group_name + ' not found.');
    else {
      res.send(JSON.stringify(users));
    }
  });
};
