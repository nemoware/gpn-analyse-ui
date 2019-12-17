const express = require('express');
const router = express.Router();

const controller = require('../controller/documentController');
router.get('/documents', controller.getDocuments);
router.get('/documentsByType', controller.getDocumentsByType);
router
  .route('/document')
  .get(controller.getDocument)
  .put(controller.updateDocument);
router.get('/attributes', controller.getAttributes);
router.get('/links', controller.getLinks);
router
  .route('/link')
  .post(controller.postLink)
  .delete(controller.deleteLink);
router
  .route('/star')
  .post(controller.addStar)
  .delete(controller.deleteStar);

module.exports = router;
