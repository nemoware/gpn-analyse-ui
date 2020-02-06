const router = require('express').Router();
const controller = require('../controller/admin-controller');

router.get('/roles', controller.getRoles);
router.get('/user', controller.getUserInfo);
router.get('/ad/groups', controller.getADGroups);
router.get('/groups', controller.getAppGroups);
router
  .route('/group')
  .post(controller.postGroup)
  .put(controller.updateGroup)
  .delete(controller.deleteGroup);

module.exports = router;
