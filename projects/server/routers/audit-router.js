const router = require('express').Router();
const controller = require('../controller/audit-controller');

router.post('/audit', controller.postAudit);
router.get('/subsidiaries', controller.getSubsidiaries);
router.get('/auditStatuses', controller.getAuditStatuses);
router.get('/audits', controller.getAudits);
router.delete('/audit', controller.deleteAudit);
router.get('/files', controller.getFiles);
router.put('/parse', controller.parse);
router.get('/violations', controller.getViolations);
router.post('/approve', controller.approve);

module.exports = router;
