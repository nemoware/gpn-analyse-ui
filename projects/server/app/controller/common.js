const db = require('../config/db.config.js');
const authorization = require('../authorization/authorization');
const Logs = db.logs;

exports.createLog = (req, id_event, message) => {

  const login = JSON.parse(req.session.message).login;

  Logs.create({
    "login": login,
    "value": message,
    "id_event": id_event
  }).then( data => {
    return true;
  }).catch( err => { console.log(err); return false;});
};


exports.hasPermission = async (req, role) => {
  let login = '';
  let promise = new Promise((resolve) => {
    login = JSON.parse(req.session.message).login;
    if (login.length === 0) return false;
    console.log(login);
    let query = `select public.f_has_permission ('${login}', '${role}') as HAS `;

    db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT })
      .then(value => {
        if (value[0].has === '1')
          resolve(true);
        else
          resolve(false);
      }).catch(err => {
      console.log(err);
    });
  });
  let result = await promise;
  console.log(`${login} has role ${role} = ${result}`);
  return result;
};
