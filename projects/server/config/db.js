const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbConfig = require('./app').db;
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

module.exports = {
  mongoose,
  Schema,
  Audit: require('../model/audit')(mongoose, Schema),
  Error: require('../model/error')(mongoose, Schema),
  User: require('../model/user')(mongoose, Schema),
  Log: require('../model/log')(mongoose, Schema),
  EventType: require('../model/event-type')(mongoose, Schema),
  Document: require('../model/document')(mongoose, Schema)
};
