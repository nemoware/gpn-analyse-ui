const express = require('express');
const router = express.Router();

const auditController = require('../controller/auditController');
const adminController = require('../controller/adminController');
const eventController = require('../controller/eventController');

router.post('/audit', auditController.postAudit);
router.get('/subsidiaries', auditController.getSubsidiaries);
router.get('/auditStatuses', auditController.getAuditStatuses);
router.post('/auditStatus', auditController.postAuditStatus);
router.get('/audits', auditController.getAudits);
router.post('/subsidiary', auditController.postSubsidiary);
router.delete('/audit', auditController.deleteAudit);

router.get('/roles', adminController.getRoles);
router.get('/appUsers', adminController.getApplicationUsers);
router.get('/groupUsers', adminController.getGroupUsers);
router.post('/user', adminController.postUser);
router.get('/userInfo', adminController.getUserInfo);
router.put('/user', adminController.updateUser);
router.delete('/user', adminController.deleteUser);

router.get('/eventType', eventController.getEventType);
router.get('/eventApp', eventController.getEventApp);

module.exports = router;
