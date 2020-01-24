const EventType = require('../config/db.config').EventType;
const Log = require('../config/db.config').Log;
const logger = require('../core/logger');

exports.getEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventType.find();
    res.status(200).json(eventTypes);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getLogs = async (req, res) => {
  try {
    const count = await Log.countDocuments();

    let sort;
    if (req.query.sort) {
      sort = { [req.query.sort]: req.query.desc === 'true' ? -1 : 1 };
    }

    const items = await Log.find().setOptions({
      skip: +req.query.skip,
      limit: +req.query.take,
      sort
    });
    res.status(200).json({ count, items });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postError = async (req, res) => {
  await logger.logError(req, res, req.body.text, 0, true);
  res.status(201).send();
};
