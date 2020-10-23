module.exports = global.ad
  ? require('./real-ad-service')
  : require('./fake-ad-service');
