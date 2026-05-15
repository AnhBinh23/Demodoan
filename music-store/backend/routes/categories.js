const express = require('express');
const router  = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/cloudinary');

router.get('/',       getAllCategories);
router.post('/',      verifyAdmin, uploadCategoryImage, createCategory);
router.put('/:id',    verifyAdmin, uploadCategoryImage, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);
module.exports = router;