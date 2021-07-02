const ldap = require('ldapjs');
const options = require('../config').ad.options;
const fs = require('fs');
const argv = require('yargs').argv;
const ssl = argv.ssl !== 'false';
const clientOptions = {
  url: options.url,
  reconnect: true,
  tlsOptions: ssl ? { ca: fs.readFileSync('./ssl/server.crt') } : {}
};

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

async function getUser(login, principalName) {
  const client = ldap.createClient(clientOptions);

  await bind(client);
  const user = await findOne(
    `(&(objectClass=user)(${
      principalName ? 'userPrincipalName' : 'sAMAccountName'
    }=${login}))`,
    options.baseDN,
    ['name', 'memberOf', 'sAMAccountName', 'distinguishedName', 'mail'],
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
  let status = 'on';

  try {
    const client = ldap.createClient(clientOptions);
    await bind(client);
    await unbind(client);
  } catch (err) {
    status = 'off';
  }

  info(status);
}

function info(status) {
  console.log(`Active Directory`);
  console.log(`Url: ${options.url}`);
  console.log(`AD status: ${status}`);
  console.log();
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

async function getGroups(filter) {
  const client = ldap.createClient(clientOptions);
  await bind(client);
  const groups = await find(
    `(&(objectClass=group)(cn=${filter ? `*${filter}*` : '*'}))`,
    options.baseDN,
    'sub',
    ['cn', 'distinguishedName'],
    client
  );
  await unbind(client);

  return groups;
}

module.exports = { getUserName, test, getUser, getGroups };
