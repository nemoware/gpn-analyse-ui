const kerberos = require('kerberos');
const ActiveDirectory = require('activedirectory');
const appConfig = require('../config/app');
const ad = new ActiveDirectory(appConfig.ad.options);

exports.getUser = (req, res) => {
  return new Promise(async resolve => {
    if (!req.headers.authorization) {
      res.set('WWW-Authenticate', 'Negotiate');
      res.status(401).send();
    } else {
      try {
        let ticket = req.headers.authorization.substring('Negotiate '.length);
        const server = await initializeServer(appConfig.ad.realm);
        server.step(ticket, err => {
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
      } catch (err) {
        console.log(err);
      }
    }
  });
};

exports.getGroupUsers = () => {
  return new Promise(resolve => {
    ad.getUsersForGroup(appConfig.ad.groupName, function(err, users) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
      }
      if (!users)
        console.log('Group: ' + appConfig.ad.groupName + ' not found.');
      else {
        resolve(users);
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

exports.test = async () => {
  let adStatus = 'on';
  let kerberosStatus = 'on';
  try {
    await this.getGroupUsers();
  } catch (err) {
    adStatus = 'off';
  }
  try {
    await initializeServer(appConfig.ad.realm);
  } catch (err) {
    kerberosStatus = 'off';
  }
  info(adStatus, kerberosStatus);
};

function info(adStatus, kerberosStatus) {
  console.log(`Kerberos`);
  console.log(`Server uses ${appConfig.ad.on ? 'AD' : 'FAKE'} authentication`);
  if (appConfig.ad.on) {
    console.log(`Url: ${appConfig.ad.options.url}`);
    console.log(`AD status: ${adStatus}`);
    console.log(`Kerberos status: ${kerberosStatus}`);
  } else {
    console.log(`Fake user: ${appConfig.ad.login}`);
  }
  console.log();
}

function initializeServer(realm) {
  return new Promise(resolve => {
    kerberos.initializeServer(realm, (err, server) => {
      resolve(server);
    });
  });
}
