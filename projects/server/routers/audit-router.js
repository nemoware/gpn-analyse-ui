const router = require('express').Router();
const controller = require('../controller/audit-controller');

router
  .route('')
  .post(controller.postAudit)
  .delete(controller.deleteAudit);
router.get('/subsidiaries', controller.getSubsidiaries);
router.get('/statuses', controller.getAuditStatuses);
router.get('/list', controller.getAudits);
router.get('/files', controller.getFiles);
router.put('/parse', controller.parse);
router.get('/violations', controller.getViolations);
router.post('/approve', controller.approve);
router.post('/exportConclusion', controller.exportConclusion);
router.get('/conclusion', controller.getConclusion);
router.put('/conclusion', controller.postConclusion);
router.get('/fetch', controller.fetchAudits);
module.exports = router;
