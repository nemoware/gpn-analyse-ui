const express = require('express');
const router = express.Router();
const controller = require('../controller/contract.controller.js');

router.get('/tag_types', controller.getTagTypes);
router.get('/docum_types', controller.getDocumTypes);
router.get('/contracts', controller.getContracts);
router.get('/contracts/:id', controller.getContractById);

router.get('/permissions', controller.getPermissions);
router.get('/permissionsuser', controller.getPermissionsByUser);
router.get('/permissionsuserid', controller.getPermissionsByUserID);

router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);
router.put('/users', controller.updateUser);
router.delete('/users', controller.deleteUser);

router.get('/get_users', controller.getUsersGroup);
router.get('/save_roles', controller.saveRoles);

module.exports = router;

