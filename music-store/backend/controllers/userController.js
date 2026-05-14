const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ADMIN: Tạo tài khoản admin/staff mới
const createAdmin = async (req, res) => {
    try {
        const { full_name, email, password, phone, role } = req.body;
        if (!full_name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu!' });
        if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        const validRoles = ['admin', 'staff'];
        if (!validRoles.includes(role)) return res.status(400).json({ message: 'Role không hợp lệ!' });
        const [[exist]] = await db.query('SELECT user_id FROM users WHERE email=?', [email]);
        if (exist) return res.status(400).json({ message: 'Email này đã tồn tại!' });
        const hash = await bcrypt.hash(password, 10);
        const [r] = await db.query(
            'INSERT INTO users (full_name, email, password, phone, role, is_active) VALUES (?,?,?,?,?,1)',
            [full_name, email, hash, phone||null, role]
        );
        res.status(201).json({ message: 'Tạo tài khoản thành công!', user_id: r.insertId });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};


const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, full_name, email, phone, address, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// ADMIN: Cập nhật thông tin user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, address, role, is_active } = req.body;

        const fields = [];
        const values = [];
        if (full_name  !== undefined) { fields.push('full_name = ?');  values.push(full_name); }
        if (phone      !== undefined) { fields.push('phone = ?');      values.push(phone); }
        if (address    !== undefined) { fields.push('address = ?');    values.push(address); }
        if (role       !== undefined) { fields.push('role = ?');       values.push(role); }
        if (is_active  !== undefined) { fields.push('is_active = ?');  values.push(is_active); }

        if (!fields.length) return res.status(400).json({ message: 'Không có dữ liệu cập nhật!' });

        values.push(id);
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);
        res.json({ message: 'Cập nhật tài khoản thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// Cập nhật profile (user tự sửa)
const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, address } = req.body;
        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?',
            [full_name, phone, address, req.user.user_id]
        );
        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hash, req.user.user_id]);
        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllUsers, updateUser, updateProfile, changePassword, createAdmin };