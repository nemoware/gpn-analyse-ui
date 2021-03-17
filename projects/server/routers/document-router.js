const router = require('express').Router();
const controller = require('../controller/document-controller');

router.get('/list', controller.getDocuments);
router.get('/list-by-type', controller.getDocumentsByType);
router
  .route('/charters')
  .get(controller.getCharters)
  .post(controller.postCharter);
router.get('/fetchCharters', controller.fetchCharters);
router.put('/activate-charter', controller.charterActivation);
router
  .route('')
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
