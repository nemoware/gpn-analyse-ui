const EventType = require('../config/db.config').EventType;
const EventApp = require('../config/db.config').EventApp;

exports.getEventType = async (req, res) => {
  EventType.find({}, async (err, events) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
    res.status(200).json(events);
  });
};

exports.getEventApp = async (req, res) => {
  EventApp.find({}, async (err, events) => {
    if (err) {
      res.status(500).json({ msg: 'error', details: err });
      console.log(err);
      logger.logError(req, res, err);
      return;
    }
    res.status(200).json(events);
  });
};
