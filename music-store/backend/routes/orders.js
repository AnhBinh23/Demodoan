const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ⚠️ QUAN TRỌNG: Route cụ thể phải đặt TRƯỚC route có tham số (/:id)
// Nếu không, Express match /admin/all vào /:id với id = "admin" → sai controller

// Admin routes — đặt LÊN TRÊN để không bị /:id bắt nhầm
router.get('/admin/all',          verifyAdmin, getAllOrders);
router.put('/admin/:id/status',   verifyAdmin, updateOrderStatus);

// User routes
router.post('/',                  verifyToken, createOrder);
router.get('/my-orders',          verifyToken, getMyOrders);
router.put('/:id/cancel',         verifyToken, cancelOrder);
router.get('/:id',                verifyToken, getOrderById); // ← để cuối cùng

module.exports = router;