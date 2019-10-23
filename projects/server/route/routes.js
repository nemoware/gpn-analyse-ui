const express = require('express');
const router = express.Router();

const auditController = require('../controller/auditController');
router.post('/audit', auditController.postAudit);
router.get('/subsidiaries', auditController.getSubsidiaries);
router.get('/auditStatuses', auditController.getAuditStatuses);
router.get('/audits', auditController.getAudits);
router.post('/subsidiary', auditController.postSubsidiary);
router.delete('/audit', auditController.deleteAudit);

const adminController = require('../controller/adminController');
router.get('/roles', adminController.getRoles);
router.get('/appUsers', adminController.getApplicationUsers);
router.get('/groupUsers', adminController.getGroupUsers);
router.post('/user', adminController.postUser);
router.get('/userInfo', adminController.getUserInfo);
router.put('/user', adminController.updateUser);
router.delete('/user', adminController.deleteUser);

const eventController = require('../controller/eventController');
router.get('/eventTypes', eventController.getEventTypes);
router.get('/logs', eventController.getLogs);
router.post('/error', eventController.postError);

const documentController = require('../controller/documentController');
router.get('/documents', documentController.getDocuments);
router.get('/document', documentController.getDocument);
router.put('/document', documentController.updateDocument);
router.get('/attributes', documentController.getAttributes);
router.get('/documentTypes', documentController.getDocumentTypes);

module.exports = router;
