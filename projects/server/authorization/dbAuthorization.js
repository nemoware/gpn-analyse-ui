const db = require('../config/db.config');
const User = db.User;

exports.checkLogin = async login => {
  return new Promise(async (resolve, reject) => {
    console.log(`check login ${login}`);
    let user = await User.findOne({ login: login });
    if (user) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};
