const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbConfig = require('./app.config').db;
const host = dbConfig.host;
const port = dbConfig.port;
const name = dbConfig.name;

// подключение
mongoose.connect(`mongodb://${host}:${port}/${name}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db = {};

db.mongoose = mongoose;
db.Schema = Schema;

db.Subsidiary = require('../model/subsidiary')(mongoose, Schema);
db.Audit = require('../model/audit')(mongoose, Schema);
db.AuditStatus = require('../model/auditStatus')(mongoose, Schema);
db.Error = require('../model/error')(mongoose, Schema);

module.exports = db;
