const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const host = process.env.GPN_DB_HOST;
const port = process.env.GPN_DB_PORT;
const database = process.env.GPN_DB_NAME;

// подключение
mongoose.connect(`mongodb://${host}:${port}/${database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db = {};

db.mongoose = mongoose;
db.Schema = Schema;

db.Subsidiary = require('../model/subsidiary')(mongoose, Schema);
db.Audit = require('../model/audit')(mongoose, Schema);
db.AuditStatus = require('../model/auditStatus')(mongoose, Schema);

module.exports = db;
