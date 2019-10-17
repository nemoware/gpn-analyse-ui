const EventType = require('../config/db.config').EventType;
const Log = require('../config/db.config').Log;
const logger = require('../core/logger');

exports.getEventTypes = async (req, res) => {
  EventType.find({}, async (err, eventTypes) => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }
    res.status(200).json(eventTypes);
  });
};

exports.getLogs = async (req, res) => {
  Log.find({}, async (err, logs) => {
    if (err) {
      logger.logError(req, res, err, 500);
      return;
    }
    res.status(200).json(logs);
  });
};
