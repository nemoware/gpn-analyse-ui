const router = require('express').Router();
const controller = require('../controller/admin-controller');

router.get('/roles', controller.getRoles);
router.get('/groups', controller.getAppGroups);
router.put('/group', controller.updateGroup);

module.exports = router;
