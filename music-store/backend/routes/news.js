const express = require('express');
const router  = express.Router();
const N = require('../controllers/newsController');
const multer = require('multer');
const uploadMem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } }).single('image');
const { verifyAdmin, verifyStaff } = require('../middleware/auth');

// Public
router.get('/tags',          N.getTags);
router.get('/',              N.getAll);
router.get('/slug/:slug',    N.getBySlug);

// Admin
router.get   ('/admin/all',      verifyStaff, N.adminGetAll);
router.get   ('/admin/:id',      verifyStaff, N.adminGetById);
router.post  ('/',               verifyAdmin, N.create);
router.put   ('/:id',            verifyAdmin, N.update);
router.delete('/:id',            verifyAdmin, N.remove);
router.patch ('/:id/toggle',     verifyAdmin, N.togglePublish);
router.post  ('/upload-image',    verifyAdmin, uploadMem, N.uploadImage);

module.exports = router;