const db = require('../config/db');

// ADMIN: Lấy tất cả users
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
        const bcrypt = require('bcrypt');
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hash, req.user.user_id]);
        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllUsers, updateUser, updateProfile, changePassword };
