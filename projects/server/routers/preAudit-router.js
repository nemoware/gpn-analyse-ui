const router = require('express').Router();
const controller = require('../controller/preAudit-controller');

router.get('/fetchPreAudits', controller.fetchPreAudits);
router.post('/uploadFiles', controller.uploadFiles);
router.get('/list', controller.getPreAudit);
router.get('/relevance', controller.getPreAuditRelevance);

module.exports = router;
