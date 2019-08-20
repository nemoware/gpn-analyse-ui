exports.authorization = (req) => {
  const login = this.get_login(req);
  return login !== null;
};

exports.get_login = (req) => {
  return getLogin(req.connection.remoteAddress.slice(7));
};

function getLogin (ip) {
  // читаем локальный json c группами для запуска с локальной машины
  const json_ip = require('./ip');
  if(json_ip.find( x => x.ip ===  ip)) {
    return json_ip.find( x => x.ip ===  ip).login;
  }
  return null;
}


