const router = require('express').Router();
const controller = require('../controller/preAudit-controller');

router.get('/fetchPreAudits', controller.fetchPreAudits);
router.post('/uploadFiles', controller.uploadFiles);
router.get('/list', controller.getPreAudit);
router.get('/relevance', controller.getPreAuditRelevance);
router.get('/documentList', controller.getDocuments);
router.get('/violations', controller.getViolations);

module.exports = router;
