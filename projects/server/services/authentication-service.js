const adService = require('../services/ad-service');
const path = require('path');

module.exports = async (req, res, next) => {
  try {
    const login = await adService.getLogin(req, res);
    if (!login) return;
    res.locals.user = await adService.getUser(login);
    next();
  } catch (err) {
    res.status(401).sendFile('error.html', {
      root: path.join(__dirname, '../file/')
    });
  }
};
