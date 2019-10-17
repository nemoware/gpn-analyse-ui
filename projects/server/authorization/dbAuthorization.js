const db = require('../config/db.config');
const User = db.User;

exports.getUser = login => {
  console.log(`check login ${login}`);
  return User.findOne({ login: login }).lean();
};
