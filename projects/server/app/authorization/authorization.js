exports.authorization = (req) => {
  let auth = false;
  var groups = getGroups(req.connection.remoteAddress.slice(7));
  if(groups.length !== 0 && groups.find( x => x.cn === 'AnalyseContract'))
    auth = true;
  return auth;
};

function getGroups (ip) {
  // читаем локальный json c группами для запуска с локальной машины
  // далее запуска с сервера читам группы из kerberos
  const json_ip = require('./ip');
  if(json_ip.find( x => x.ip ===  ip)) {
    return json_ip.find( x => x.ip ===  ip).groups;
  }
  return [];
}

