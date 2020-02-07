'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const dbConfig = require('../config/app').db;
const host = dbConfig.host;
const port = dbConfig.port;
const name = dbConfig.name;

// подключение
mongoose
  .connect(`mongodb://${host}:${port}/${name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    info('on');
  })
  .catch(() => {
    info('off');
  });

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