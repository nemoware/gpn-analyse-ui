const db = require('../config/db.config.js');
const Users = db.users;

exports.check_login = async(login) => {

  return new Promise((resolve, reject) => {

    console.log(`check login ${login}`);

    let query = `select
      count(*) as count
      from users u 
      where upper(u.login) = upper('${login}')`;

    db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
      .then(user => {

        if(user && user[0] && user[0].count > 0)
          resolve(true);
        else resolve(false);

      }).catch( err => {

      console.log(err);
      reject(err);

    });

  });

};
