const path = require('path');
const { Group } = require('../models');
const groups = require('../config/config').ad.groups;

module.exports = async (req, res, next) => {
  const userGroups = res.locals.user.memberOf;
  const targets = Object.keys(groups).filter(group =>
    userGroups.includes(groups[group])
  );
  const appGroups = await Group.find({ target: { $in: targets } }, 'roles', {
    lean: true
  });

  let roles = [];
  for (let group of appGroups) {
    roles = roles.concat(
      group.roles.filter(r => !roles.map(r => r._id).includes(r._id))
    );
  }

  if (!roles.length) {
    return res.status(403).sendFile('403.html', {
      root: path.join(__dirname, '../file/')
    });
  }

  const controller = req.url.split('/')[2];
  let check = true;
  switch (controller) {
    case 'admin':
      check = !!roles.find(r => r.appPage === 'admin');
      break;
    case 'audit':
    case 'document':
      check = !!roles.find(
        r => r.appPage === 'audit' || r.appPage === 'charter'
      );
      break;
    case 'event':
      check = !!roles.find(r => r.appPage === 'events');
      break;
  }

  if (!check) return res.sendStatus(403);

  res.locals.user.roles = roles;
  next();
};
