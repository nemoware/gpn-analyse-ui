const appConfig = require('../config/app');
const users = require('../json/fake-user');
const groups = require('../json/fake-group');

function getUser(login, principalName) {
  const user = users.find(
    u => u[principalName ? 'userPrincipalName' : 'sAMAccountName'] === login
  );
  if (!user) throw new Error(`No user with login ${login} in fake AD`);
  return user;
}

function getUserName(login) {
  const user = getUser(login);
  return user.name;
}

function test() {
  console.log(`Active Directory`);
  console.log(`Url: ${appConfig.ad.options.url}`);
  console.log(`AD status: off`);
  console.log();
}

async function getGroups(filter) {
  return filter
    ? groups.filter(g => ~g.cn.toLowerCase().indexOf(filter.toLowerCase()))
    : groups;
}

module.exports = { getUserName, test, getUser, getGroups };
