const path = require('path');
const kerberos = require('kerberos');
const adService = require('../services/ad-service');
const jwtService = require('../services/jwt-service');
const principal = require('../config').ad.principal;

async function kerberosAuthentication(req, res, next) {
  if (res.locals.user) return next();

  try {
    const login = await getLogin(req, res);
    if (!login) return;

    const user = await adService.getUser(login, true);
    const accessToken = jwtService.getAccessToken(user);
    res.cookie('jwt', accessToken, { httpOnly: true });
    res.locals.user = user;
    next();
  } catch (err) {
    res.status(401).sendFile('401.html', {
      root: path.join(__dirname, '../file/')
    });
  }
}

async function getLogin(req, res) {
  if (!global.kerberos) return global.login;

  if (!req.headers.authorization) {
    res.set('WWW-Authenticate', 'Negotiate');
    res.status(401).send();
  } else {
    try {
      let ticket = req.headers.authorization.substring('Negotiate '.length);
      console.log(ticket);
      const server = await initializeServer(principal);
      console.log(server);
      await step(server, ticket);
      console.log(server.username);
      return server.username;
    } catch (err) {
      console.log(err);
    }
  }
}

function initializeServer(realm) {
  return new Promise((resolve, reject) => {
    kerberos.initializeServer(realm, (err, server) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

function step(server, ticket) {
  return new Promise((resolve, reject) => {
    server.step(ticket, err => {
      if (err) return reject(err);
      resolve(server.username);
    });
  });
}

async function test() {
  let status = 'on';
  try {
    await initializeServer(principal);
  } catch (err) {
    status = 'off';
  }
  info(status);
}

function info(status) {
  console.log('Kerberos');
  console.log(`Kerberos status: ${status}`);
  console.log(
    `Server uses ${global.kerberos ? 'Kerberos' : 'Fake'} authentication`
  );
  if (!global.kerberos) {
    console.log(`Fake user: ${global.login}`);
  }
  console.log();
}

module.exports = { authenticate: kerberosAuthentication, test };
