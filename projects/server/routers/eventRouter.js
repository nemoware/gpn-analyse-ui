const express = require('express');
const router = express.Router();

const controller = require('../controller/eventController');
router.get('/eventTypes', controller.getEventTypes);
router.get('/logs', controller.getLogs);
router.post('/error', controller.postError);

module.exports = router;
