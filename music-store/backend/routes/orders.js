const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// User routes
router.post('/',              verifyToken, createOrder);
router.get('/my-orders',      verifyToken, getMyOrders);
router.get('/:id',            verifyToken, getOrderById);
router.put('/:id/cancel',     verifyToken, cancelOrder);

// Admin routes
router.get('/admin/all',      verifyAdmin, getAllOrders);
router.put('/admin/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;
