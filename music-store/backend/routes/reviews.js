const express = require('express');
const router  = express.Router();
const { getStats, getRevenueByMonth, getTopProducts } = require('../controllers/statsController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/overview',       verifyAdmin, getStats);
router.get('/revenue-month',  verifyAdmin, getRevenueByMonth);
router.get('/top-products',   verifyAdmin, getTopProducts);

module.exports = router;