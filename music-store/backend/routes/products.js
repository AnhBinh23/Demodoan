const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { verifyAdmin } = require('../middleware/auth');

const {
    uploadProductImage
} = require('../config/cloudinary');

// ================= ROUTES =================

// Lấy danh sách sản phẩm
router.get('/', getAllProducts);

// Lấy chi tiết sản phẩm
router.get('/:id', getProductById);

// Thêm sản phẩm
router.post('/', verifyAdmin, (req, res, next) => {
    uploadProductImage(req, res, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        next();
    });
}, createProduct);

// Cập nhật sản phẩm
router.put('/:id', verifyAdmin, (req, res, next) => {
    uploadProductImage(req, res, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        next();
    });
}, updateProduct);

// Xóa sản phẩm
router.delete(
    '/:id',
    verifyAdmin,
    deleteProduct
);

module.exports = router;