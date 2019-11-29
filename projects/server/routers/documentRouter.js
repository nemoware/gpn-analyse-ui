const express = require('express');
const router = express.Router();

const controller = require('../controller/documentController');
router.get('/documents', controller.getDocuments);
router.get('/documentsByType', controller.getDocumentsByType);
router.get('/document', controller.getDocument);
router.put('/document', controller.updateDocument);
router.get('/attributes', controller.getAttributes);
router.get('/documentTypes', controller.getDocumentTypes);
router.get('/links', controller.getLinks);
router.post('/link', controller.postLink);
router.put('/link', controller.updateLink);
router.delete('/link', controller.deleteLink);

module.exports = router;
