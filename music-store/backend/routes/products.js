const express = require('express');
const router  = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');

router.get('/',       getAllProducts);
router.get('/:id',    getProductById);
router.post('/',      verifyAdmin, uploadProductImage, createProduct);
router.put('/:id',    verifyAdmin, uploadProductImage, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;