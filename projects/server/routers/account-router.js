const router = require('express').Router();
const controller = require('../controller/account-controller');

router.get('/user', controller.getUserInfo);
router.get('/robot', controller.getRobotState);

module.exports = router;
