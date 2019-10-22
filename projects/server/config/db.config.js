const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbConfig = require('./app.config').db;
const host = dbConfig.host;
const port = dbConfig.port;
const name = dbConfig.name;

const initialize = require('../core/initialize');

// подключение
mongoose
  .connect(`mongodb://${host}:${port}/${name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

let db = {};

db.mongoose = mongoose;
db.Schema = Schema;

db.Subsidiary = require('../model/subsidiary')(mongoose, Schema);
db.Audit = require('../model/audit')(mongoose, Schema);
db.Error = require('../model/error')(mongoose, Schema);
db.User = require('../model/user')(mongoose, Schema);
db.Role = require('../model/role')(mongoose, Schema);
db.Log = require('../model/log')(mongoose, Schema);
db.EventType = require('../model/eventType')(mongoose, Schema);
db.Document = require('../model/document')(mongoose, Schema);
db.DocumentType = require('../model/documentType')(mongoose, Schema);
db.Dictionary = require('../model/dictionary')(mongoose, Schema);

initialize
  .initializeData(db)
  .then(() => {
    console.log('Initial data inserted');
    console.log();
  })
  .catch(err => {
    console.log('Error while inserting initial data:');
    console.log(err);
    console.log();
  });

module.exports = db;
