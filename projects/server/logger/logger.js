const db = require('../config/db.config');
const Log = db.Log;
const Error = db.Error;

exports.log = (req, res) => {
  let log = new Log({
    time: new Date(),
    method: req.method,
    url: req.url,
    login: 'user'
  });
  log.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }
  });
};

exports.error = (req, res, err) => {
  let error = new Error({
    time: new Date(),
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    login: 'user',
    text: err
  });
  error.save(err => {
    if (err) {
      console.log(err);
      res.status(500).json({ msg: 'error', details: err });
      return;
    }
  });
};
