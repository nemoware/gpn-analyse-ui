const express = require('express');
const router = express.Router();

const controller = require('../controller/admin-controller');
router.get('/roles', controller.getRoles);
router.get('/userInfo', controller.getUserInfo);

module.exports = router;
