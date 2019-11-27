const express = require('express');
const router = express.Router();

const auditController = require('../controller/auditController');
router.post('/audit', auditController.postAudit);
router.get('/subsidiaries', auditController.getSubsidiaries);
router.get('/auditStatuses', auditController.getAuditStatuses);
router.get('/audits', auditController.getAudits);
router.post('/subsidiary', auditController.postSubsidiary);
router.delete('/audit', auditController.deleteAudit);
router.get('/files', auditController.getFiles);
router.put('/parse', auditController.parse);

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
router.get('/documentsByType', documentController.getDocumentsByType);
router.get('/document', documentController.getDocument);
router.put('/document', documentController.updateDocument);
router.get('/attributes', documentController.getAttributes);
router.get('/documentTypes', documentController.getDocumentTypes);
router.get('/links', documentController.getLinks);
router.post('/link', documentController.postLink);
router.put('/link', documentController.updateLink);
router.delete('/link', documentController.deleteLink);

const developerController = require('../controller/developerController');
router.post('/dev/audit', developerController.postAudit);
router.get('/dev/attributes', developerController.getAttributes);
router.get('/dev/attributes/:id', developerController.getDocumentAttributes);

module.exports = router;
