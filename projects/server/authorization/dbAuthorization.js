const roles = require('../json/role');
const db = require('../config/db.config');
const User = db.User;

exports.getUser = async login => {
  let count = await User.countDocuments();

  let user;
  if (!count) {
    let role = roles.find(r => r.name === 'RAdmin');
    user = new User({
      login: login,
      roles: [role]
    });
    await user.save();
  }

  if (!user) {
    user = await User.findOne({ login: login });
  }

  return user.toObject();
};
