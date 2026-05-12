// routes/sheets.js - dùng multer memoryStorage cho Cloudinary
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet } = require('../controllers/sheetController');
const { verifyAdmin } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/',    getAllSheets);
router.get('/:id', getSheetById);
router.post('/',   verifyAdmin, upload.fields([{ name: 'sheet_file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createSheet);
router.put('/:id', verifyAdmin, upload.fields([{ name: 'sheet_file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateSheet);
router.delete('/:id', verifyAdmin, deleteSheet);

module.exports = router;