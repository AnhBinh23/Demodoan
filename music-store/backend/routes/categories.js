const express    = require('express');
const router     = express.Router();
const fileUpload = require('express-fileupload');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');

router.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    createParentPath: true,
}));

router.get('/',       getAllCategories);
router.post('/',      verifyAdmin, createCategory);
router.put('/:id',    verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

module.exports = router;
