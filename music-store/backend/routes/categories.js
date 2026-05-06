// routes/categories.js - dùng multer memoryStorage cho Cloudinary
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',       getAllCategories);
router.post('/',      verifyAdmin, upload.single('image'), createCategory);
router.put('/:id',    verifyAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

module.exports = router;