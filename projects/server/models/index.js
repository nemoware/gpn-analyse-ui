'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const options = require('../config').db;
const host = options.host;
const port = options.port;
const name = options.name;

const groups = require('../config').ad.groups;
const roles = require('../json/role');

const riskMatrix = require('../json/riskMatrix.json');
const limitValues = require('../json/limit-values.json');
const defaultCatalogValues = require('../json/defaulCatalogValues.json');

// подключение
mongoose
  .connect(`mongodb://${host}:${port}/${name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(async () => {
    const count = await db.Group.countDocuments();
    if (!count) {
      for (let key in groups) {
        let role = [];
        switch (key) {
          case 'admin':
            role = [roles.find(r => r._id === '3')];
            break;
          case 'audit':
            role = [roles.find(r => r._id === '1')];
            break;
          case 'event':
            role = [roles.find(r => r._id === '2')];
            break;
        }
        const group = new db.Group({
          cn: groups[key]
            .split(',')
            .find(l => l.split('=')[0].toLowerCase() === 'cn')
            .split('=')[1],
          distinguishedName: groups[key],
          target: key,
          roles: role
        });
        await group.save();
      }
    }

    db.Risk.countDocuments((err, count) => {
      if (count === 0) {
        db.Risk.insertMany(riskMatrix);
      }
    });

    db.LimitValue.countDocuments((err, count) => {
      if (count === 0) {
        db.LimitValue.insertMany(limitValues);
      }
    });

    db.Catalog.countDocuments((err, count) => {
      if (count === 0) {
        db.Catalog.create(defaultCatalogValues);
      }
    });

    info();
  })
  .catch(err => info(err));

function info(err) {
  console.log(`Database`);
  console.log(`Name: ${name}`);
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Status: ${err ? 'off' : 'on'}`);
  if (err) console.log(err);
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
