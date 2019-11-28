const express = require('express');
const router = express.Router();

const controller = require('../controller/adminController');
router.get('/roles', controller.getRoles);
router.get('/appUsers', controller.getApplicationUsers);
router.get('/groupUsers', controller.getGroupUsers);
router.post('/user', controller.postUser);
router.get('/userInfo', controller.getUserInfo);
router.put('/user', controller.updateUser);
router.delete('/user', controller.deleteUser);

module.exports = router;
