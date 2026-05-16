const express = require('express');
const router  = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/cloudinary');

router.get('/', getAllCategories);

router.post('/', verifyAdmin, (req, res, next) => {
    uploadCategoryImage(req, res, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        next();
    });
}, createCategory);

router.put('/:id', verifyAdmin, (req, res, next) => {
    uploadCategoryImage(req, res, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        next();
    });
}, updateCategory);

router.delete('/:id', verifyAdmin, deleteCategory);
module.exports = router;