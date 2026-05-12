const express = require('express');
const router  = express.Router();
const { getAllUsers, updateUser, updateProfile, changePassword, createAdmin } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// User tự cập nhật
router.put('/profile',          verifyToken, updateProfile);
router.put('/change-password',  verifyToken, changePassword);

// Admin quản lý
router.get ('/admin/all',        verifyAdmin, getAllUsers);
router.post('/admin/create',     verifyAdmin, createAdmin);
router.put ('/admin/:id',        verifyAdmin, updateUser);

module.exports = router;