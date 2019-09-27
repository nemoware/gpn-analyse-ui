const express = require('express');
const router = express.Router();

const auditController = require('../controller/auditController.js');

router.post('/audit', auditController.postAudit);
router.get('/subsidiaries', auditController.getSubsidiaries);
router.get('/auditStatuses', auditController.getAuditStatuses);
router.post('/auditStatus', auditController.postAuditStatus);
router.get('/audits', auditController.getAudits);
router.post('/subsidiary', auditController.postSubsidiary);

module.exports = router;
