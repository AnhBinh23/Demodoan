const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ĐĂNG KÝ
const register = async (req, res) => {
    try {
        const { full_name, email, phone, password, address } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo tài khoản mới
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, phone, password, address) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, phone, hashedPassword, address]
        );

        res.status(201).json({
            message: 'Đăng ký thành công!',
            user_id: result.insertId
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// ĐĂNG NHẬP
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
        );
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                user_id:   user.user_id,
                full_name: user.full_name,
                email:     user.email,
                role:      user.role,
                avatar:    user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// LẤY THÔNG TIN CÁ NHÂN
const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, full_name, email, phone, address, avatar, role, created_at FROM users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};


module.exports = { register, login, getProfile };
