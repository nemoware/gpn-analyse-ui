const { Group } = require('../models');

module.exports = async (req, res, next) => {
  const userGroups = res.locals.user.memberOf;
  const appGroups = await Group.find(
    { distinguishedName: { $in: userGroups } },
    'roles',
    { lean: true }
  );
  let roles = [];
  for (let group of appGroups) {
    roles = roles.concat(
      group.roles.filter(r => !roles.map(r => r._id).includes(r._id))
    );
  }
  res.locals.user.roles = roles;
  next();
};
