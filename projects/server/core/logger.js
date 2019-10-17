const db = require('../config/db.config');
const Error = db.Error;
const Log = db.Log;
const EventType = db.EventType;

exports.logError = (req, res, err) => {
  let error = new Error({
    time: new Date(),
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    login: 'user',
    text: err,
    body: req.body
  });
  error.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }
  });
};

exports.log = async (req, res, event) => {
  let eventType = await EventType.findOne({ name: event });
  if (!eventType) {
    eventType = new EventType({ name: event });
    try {
      await eventType.save();
    } catch (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
  }

  let log = new Log({
    time: new Date(),
    login: req.session.message.login,
    eventType: eventType
  });
  log.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
    }
  });
};
