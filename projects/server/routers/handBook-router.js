const router = require('express').Router();
const controller = require('../controller/handBook-controller');

router.get('/riskMatrix', controller.getRisks);
router.post('/riskMatrix', controller.postRisk);
router.delete('/riskMatrix', controller.deleteRisk);
router.put('/riskMatrix', controller.updateRisk);

router.get('/limitValues', controller.getLimitValues);
router.post('/limitValues', controller.postLimitValue);
router.delete('/limitValues', controller.deleteLimitValue);
router.put('/limitValues', controller.updateLimitValue);

router.get('/violationTypes', controller.getViolationTypes);

router.get('/bookValues', controller.getBookValues);
router.post('/bookValues', controller.postBookValue);
router.delete('/bookValues', controller.deleteBookValue);
router.put('/bookValues', controller.updateBookValue);

router.post('/affiliatesList', controller.saveAffiliatesList);
router.get('/fetchAffiliates', controller.fetchAffiliates);

module.exports = router;
