// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, changePassword } = require('../controllers/userController');

router.post('/register', register);
router.post('/login',    login);
router.get('/profile',   verifyToken, getProfile);
router.put('/profile',         verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
module.exports = router;
