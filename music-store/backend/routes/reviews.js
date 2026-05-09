const express = require('express');
const router  = express.Router();
const { createReview, deleteReview, getReviewsByProduct } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

router.get('/product/:product_id', getReviewsByProduct);
router.post('/',      verifyToken, createReview);
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
