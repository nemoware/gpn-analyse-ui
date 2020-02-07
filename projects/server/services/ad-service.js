module.exports = require('../config/app').ad.on
  ? require('./real-ad-service')
  : require('./fake-ad-service');
