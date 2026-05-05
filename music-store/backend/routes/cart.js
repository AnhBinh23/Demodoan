// routes/cart.js
const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

router.get('/',          verifyToken, getCart);
router.post('/',         verifyToken, addToCart);
router.put('/:cart_id',  verifyToken, updateCart);
router.delete('/:cart_id', verifyToken, removeFromCart);

module.exports = router;
