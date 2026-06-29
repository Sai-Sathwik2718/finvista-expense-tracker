const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', reportController.getReports);
router.get('/export/pdf', reportController.exportPdf);
router.get('/export/excel', reportController.exportExcel);

module.exports = router;
