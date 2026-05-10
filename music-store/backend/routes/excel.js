const express = require('express');
const router  = express.Router();
const { exportTimekeeping, exportStudents, exportRevenue } = require('../controllers/excelController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/timekeeping/:month', verifyAdmin, exportTimekeeping);
router.get('/students',          verifyAdmin, exportStudents);
router.get('/revenue/:month',    verifyAdmin, exportRevenue);

module.exports = router;
