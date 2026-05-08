const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'image',        maxCount: 1 },
    { name: 'thumb_images', maxCount: 4 },
]);

router.get('/',       getAllProducts);
router.get('/:id',    getProductById);
router.post('/',      verifyAdmin, upload, createProduct);
router.put('/:id',    verifyAdmin, upload, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;
