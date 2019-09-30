const db = require('../config/db.config');
const Error = db.Error;

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
