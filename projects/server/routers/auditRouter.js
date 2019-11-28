const express = require('express');
const router = express.Router();

const controller = require('../controller/auditController');
router.post('/audit', controller.postAudit);
router.get('/subsidiaries', controller.getSubsidiaries);
router.get('/auditStatuses', controller.getAuditStatuses);
router.get('/audits', controller.getAudits);
router.delete('/audit', controller.deleteAudit);
router.get('/files', controller.getFiles);
router.put('/parse', controller.parse);

module.exports = router;
