const express = require('express');
const router = express.Router();

const auditController = require('../controller/auditController');
const adminController = require('../controller/adminController');

router.post('/audit', auditController.postAudit);
router.get('/subsidiaries', auditController.getSubsidiaries);
router.get('/auditStatuses', auditController.getAuditStatuses);
router.post('/auditStatus', auditController.postAuditStatus);
router.get('/audits', auditController.getAudits);
router.post('/subsidiary', auditController.postSubsidiary);
router.delete('/audit', auditController.deleteAudit);

router.get('/roles', adminController.getRoles);
router.get('/users', adminController.getUsers);
router.post('/user', adminController.postUser);

module.exports = router;
