const { EventType, Log } = require('../config/db.config');
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
    let sort;
    if (req.query.column) {
      sort = { [req.query.column]: req.query.sort === 'asc' ? 1 : -1 };
    }

    const where = {};

    const eventType = req.query.eventType;
    const dateTo = req.query.dateTo;
    const dateFrom = req.query.dateFrom;

    if (eventType) {
      where['eventType._id'] = { $in: eventType.split(',') };
    }

    where.login = {
      $regex: `.*${req.query.login || ''}.*`,
      $options: 'i'
    };

    if (dateTo) {
      where.time = { $lte: dateTo };
    }

    if (dateFrom) {
      where.time = { $gte: dateFrom };
    }

    const count = await Log.countDocuments(where);
    let items = await Log.find(where, '-_id -__v', { lean: true }).setOptions({
      skip: +req.query.skip,
      limit: +req.query.take,
      sort
    });

    items = items.map(i => {
      i.eventTypeName = i.eventType.name;
      i.eventTypeId = i.eventType._id;
      delete i.eventType;
      return i;
    });

    res.send({ count, items });
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postError = async (req, res) => {
  await logger.logError(req, res, req.body.text, 0, true);
  res.status(201).send();
};
