const db = require('../config/db.config');
const User = db.User;
const Role = db.Role;

exports.getUser = async login => {
  let count = await User.countDocuments();

  let user;
  if (!count) {
    let role = await Role.findOne({ name: 'RAdmin' }).lean();
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
