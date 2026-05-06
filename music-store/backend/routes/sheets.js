const express    = require('express');
const router     = express.Router();
const fileUpload = require('express-fileupload');
const { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet } = require('../controllers/sheetController');
const { verifyAdmin } = require('../middleware/auth');

// Middleware upload chỉ cho route này
router.use(fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    createParentPath: true,
}));

// Public
router.get('/',    getAllSheets);
router.get('/:id', getSheetById);

// Admin
router.post('/',      verifyAdmin, createSheet);
router.put('/:id',    verifyAdmin, updateSheet);
router.delete('/:id', verifyAdmin, deleteSheet);

module.exports = router;
