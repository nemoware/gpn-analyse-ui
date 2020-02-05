const { EventType, Log } = require('../config/db');
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
      sort = {
        [req.query.column === 'name' ? 'eventType.name' : req.query.column]:
          req.query.sort === 'asc' ? 1 : -1
      };
    }

    const where = [];

    const eventType = req.query.eventType;
    let dateTo = req.query.dateTo;
    const dateFrom = req.query.dateFrom;

    if (eventType) {
      where.push({ 'eventType._id': { $in: eventType.split(',') } });
    }

    where.push({
      login: {
        $regex: `.*${req.query.login || ''}.*`,
        $options: 'i'
      }
    });

    if (dateTo) {
      dateTo = toDate(dateTo);
      dateTo.setDate(dateTo.getDate() + 1);
      where.push({ time: { $lt: dateTo } });
    }

    if (dateFrom) {
      where.push({ time: { $gte: toDate(dateFrom) } });
    }

    const count = await Log.countDocuments({ $and: where });
    let items = await Log.find({ $and: where }, '-_id -__v', {
      lean: true
    }).setOptions({
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

function toDate(s) {
  const parts = s.split('.');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}
