const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbConfig = require('./app.config').db;
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

let db = {};

db.mongoose = mongoose;
db.Schema = Schema;

db.Audit = require('../model/audit')(mongoose, Schema);
db.Error = require('../model/error')(mongoose, Schema);
db.User = require('../model/user')(mongoose, Schema);
db.Log = require('../model/log')(mongoose, Schema);
db.EventType = require('../model/eventType')(mongoose, Schema);
db.Document = require('../model/document')(mongoose, Schema);

module.exports = db;
