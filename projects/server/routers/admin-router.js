const express = require('express');
const router = express.Router();

const controller = require('../controller/admin-controller');
router.get('/roles', controller.getRoles);
router.get('/user', controller.getUserInfo);
router.get('/groups', controller.getGroups);

module.exports = router;
