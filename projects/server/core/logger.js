const db = require('../models');
const Error = db.Error;
const Log = db.Log;
const EventType = db.EventType;
const version = require('../../../package.json').version;
const logFilePath = require('../config/index').logger.logFilePath;
const cef = require('cef');
exports.logError = async (req, res, err, status, silent) => {
  if (!silent) {
    res.status(status).json({ msg: 'error', details: err.toString() });
  }
  console.log(err);

  let error = new Error({
    time: new Date(),
    method: req.method,
    url: req.url,
    statusCode: status,
    statusMessage: res.statusMessage,
    login: res.locals.user.sAMAccountName,
    text: err,
    body: req.body
  });

  try {
    await error.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'error', details: err });
  }
};

exports.logLocalError = async err => {
  console.log(err);

  let error = new Error({
    time: new Date(),
    text: err
  });

  try {
    await error.save();
  } catch (err) {
    console.log(err);
  }
};

exports.log = async (req, res, event, details) => {
  let eventType = await EventType.findOne({ name: event });
  if (!eventType) {
    eventType = new EventType({ name: event });
    try {
      await eventType.save();
    } catch (err) {
      this.logError(req, res, err, 500);
      return;
    }
  }

  let log = new Log({
    time: new Date(),
    login: res.locals.user.sAMAccountName,
    eventType,
    details
  });

  // Application config
  const logger = new cef.Logger({
    vendor: 'Газпром нефть',
    product: 'Система Корпоративного Контроля',
    version: version,
    syslog_transport: message => {
      const fs = require('fs');
      let data = JSON.stringify(message, null, 2);
      fs.appendFileSync(logFilePath, data + '\n');
    }
  });

  logger.info({
    signature: eventType.name,
    name: details || '',
    extensions: {
      suser: res.locals.user.sAMAccountName
    }
  });
  try {
    await log.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'error', details: err });
  }
};
