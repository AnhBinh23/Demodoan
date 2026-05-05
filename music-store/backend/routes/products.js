const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

// Cấu hình upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/products/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/',         getAllProducts);
router.get('/:id',      getProductById);
router.post('/',        verifyAdmin, upload.single('image'), createProduct);
router.put('/:id',      verifyAdmin, updateProduct);
router.delete('/:id',   verifyAdmin, deleteProduct);

module.exports = router;
