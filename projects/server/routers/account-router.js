const router = require('express').Router();
const controller = require('../controller/account-controller');

router.get('/user', controller.getUserInfo);

module.exports = router;
