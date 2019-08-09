const express = require('express');
const router = express.Router();
const controller = require('../controller/contract.controller.js');
// get tags
router.get('/tags', controller.getTags);
// get contracts
router.get('/contracts', controller.getContracts);
// get contract by id
router.get('/contracts/:id', controller.getContractById);

module.exports = router;

