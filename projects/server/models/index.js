'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const options = require('../config/config').db;
const host = options.host;
const port = options.port;
const name = options.name;

const defaultGroup = require('../config/config').ad.group;
const roles = require('../json/role');

// подключение
mongoose
  .connect(`mongodb://${host}:${port}/${name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(async () => {
    const count = await db.Group.countDocuments({
      distinguishedName: defaultGroup
    });
    if (!count) {
      const group = new db.Group({
        cn: defaultGroup
          .split(',')
          .find(l => l.split('=')[0].toLowerCase() === 'cn')
          .split('=')[1],
        distinguishedName: defaultGroup,
        roles: [roles.find(r => r._id === '3')]
      });
      await group.save();
    }
    info('on');
  })
  .catch(() => info('off'));

function info(status) {
  console.log(`Database`);
  console.log(`Name: ${name}`);
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Status: ${status}`);
  console.log();
}

const db = { mongoose, Schema };

fs.readdirSync(__dirname)
  .filter(
    file => file.indexOf('.') && file !== basename && file.endsWith('.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(mongoose, Schema);
    db[model.modelName] = model;
  });

module.exports = db;
