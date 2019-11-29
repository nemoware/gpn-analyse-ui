const express = require('express');
const router = express.Router();

const controller = require('../controller/developerController');
router.post('/dev/audit', controller.postAudit);
router.get('/dev/attributes', controller.getAttributes);
router.get('/dev/attributes/:id', controller.getDocumentAttributes);

module.exports = router;
