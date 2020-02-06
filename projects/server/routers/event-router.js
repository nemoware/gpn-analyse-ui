const router = require('express').Router();
const controller = require('../controller/event-controller');

router.get('/types', controller.getEventTypes);
router.get('/logs', controller.getLogs);
router.post('/error', controller.postError);

module.exports = router;
