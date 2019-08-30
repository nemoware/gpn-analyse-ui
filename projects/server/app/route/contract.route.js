const express = require('express');
const router = express.Router();

const controllerContract = require('../controller/contract.controller.js');
const controllerAdmin= require('../controller/admin.controller');
const controllerEvents= require('../controller/event.viewer.controller');

router.get('/tag_types', controllerContract.getTagTypes);
router.get('/docum_types', controllerContract.getDocumTypes);
router.get('/contracts', controllerContract.getContracts);
router.get('/contracts/:id', controllerContract.getContractById);

router.get('/permissions', controllerAdmin.getPermissions);
router.get('/permissionsuser', controllerAdmin.getPermissionsByUser);
router.get('/permissionsuserid', controllerAdmin.getPermissionsByUserID);

router.get('/users', controllerAdmin.gerUsers);
router.post('/users', controllerAdmin.createUser);
router.put('/users', controllerAdmin.updateUser);
router.delete('/users', controllerAdmin.deleteUser);

router.get('/get_users', controllerAdmin.getUsersGroup);
router.get('/save_roles', controllerAdmin.saveRoles);

router.get('/eventsapp', controllerEvents.getEventsApp);
router.get('/events', controllerEvents.getEvents);

module.exports = router;

