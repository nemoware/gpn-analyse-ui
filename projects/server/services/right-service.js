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

  const controller = req.url.split('/')[2];
  let check = true;
  switch (controller) {
    case 'admin':
      check = !!roles.find(r => r.appPage === 'admin');
      break;
    case 'audit':
    case 'document':
      check = !!roles.find(r => r.appPage === 'audit');
      break;
    case 'event':
      check = !!roles.find(r => r.appPage === 'events');
      break;
  }

  if (!check) return res.sendStatus(403);

  res.locals.user.roles = roles;
  next();
};
