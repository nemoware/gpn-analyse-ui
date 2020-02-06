const kerberos = require('kerberos');
const ldap = require('ldapjs');
const appConfig = require('../config/app');
const options = appConfig.ad.options;
const realm = appConfig.ad.realm;

function bind(client) {
  return new Promise((resolve, reject) => {
    client.bind(options.username, options.password, bindErr => {
      if (bindErr) {
        return client.unbind(unbindErr => {
          if (unbindErr) return reject(unbindErr);
          reject(bindErr);
        });
      }
      resolve();
    });
  });
}

function unbind(client) {
  return new Promise((resolve, reject) => {
    client.unbind(err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function getLogin(req, res) {
  if (!appConfig.ad.kerberos) return appConfig.ad.login;

  if (!req.headers.authorization) {
    res.set('WWW-Authenticate', 'Negotiate');
    res.status(401).send();
  } else {
    try {
      let ticket = req.headers.authorization.substring('Negotiate '.length);
      const server = await initializeServer(realm);
      await step(server, ticket);
      return server.username;
    } catch (err) {
      console.log(err);
    }
  }
}

function step(server, ticket) {
  return new Promise((resolve, reject) => {
    server.step(ticket, err => {
      if (err) return reject(err);
      resolve(server.username);
    });
  });
}

async function getUser(login) {
  const client = ldap.createClient({
    url: options.url
  });

  await bind(client);
  const user = await findOne(
    `(&(objectClass=user)(sAMAccountName=${login}))`,
    options.baseDN,
    ['name', 'memberOf', 'sAMAccountName', 'distinguishedName'],
    client
  );
  await unbind(client);

  if (!user)
    throw new Error(`There is no user in AD with sAMAccountName ${login}`);
  return user;
}

async function getUserName(login) {
  const user = await getUser(login);
  return user.name;
}

async function test() {
  let adStatus = 'on';
  let kerberosStatus = 'on';
  try {
    const client = ldap.createClient({
      url: options.url
    });
    await bind(client);
    await unbind(client);
  } catch (err) {
    adStatus = 'off';
  }
  try {
    await initializeServer(appConfig.ad.realm);
  } catch (err) {
    kerberosStatus = 'off';
  }
  info(adStatus, kerberosStatus);
}

function info(adStatus, kerberosStatus) {
  console.log(`Active Directory`);
  console.log(`Url: ${appConfig.ad.options.url}`);
  console.log(`AD status: ${adStatus}`);
  console.log();

  console.log('Kerberos');
  console.log(`Kerberos status: ${kerberosStatus}`);
  console.log(
    `Server uses ${appConfig.ad.kerberos ? 'Kerberos' : 'Fake'} authentication`
  );
  if (!appConfig.ad.kerberos) {
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

function getObject(entry, attributes) {
  const object = {};
  for (let attribute of entry.attributes.filter(
    a => !attributes || !attributes.length || attributes.includes(a.type)
  )) {
    const values = attribute._vals.map(v => v.toString());
    object[attribute.type] = values.length === 1 ? values[0] : values;
  }
  return object;
}

async function findOne(filter, base, attributes, client) {
  const entries = await find(filter, base, 'sub', attributes, client);
  return entries[0];
}

function find(filter, base, scope, attributes, client) {
  return new Promise((resolve, reject) => {
    client.search(base, { filter, scope }, (err, res) => {
      const result = [];
      res.on('searchEntry', entry => {
        const object = getObject(entry, attributes);
        result.push(object);
      });
      res.on('error', err => {
        reject(err);
      });
      res.on('end', () => {
        resolve(result);
      });
    });
  });
}

module.exports = { getUserName, test, getLogin, getUser };
