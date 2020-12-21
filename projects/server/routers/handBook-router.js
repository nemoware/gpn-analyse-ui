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

module.exports = router;
