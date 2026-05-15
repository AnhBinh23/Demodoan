const db = require('../config/db');
require('dotenv').config();

const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, COUNT(p.product_id) AS product_count
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id AND p.is_active = 1
            GROUP BY c.category_id
            ORDER BY c.category_name`);
        res.json(categories);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;
        if (!category_name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc!' });
        let image_url = null;
        if (req.file) {
            image_url = req.file.path || req.file.secure_url;
        }
        const [result] = await db.query(
            'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
            [category_name, description || null, image_url]
        );
        res.status(201).json({ message: 'Thêm danh mục thành công!', category_id: result.insertId });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;
        const sets   = ['category_name=?', 'description=?'];
        const params = [category_name, description || null];
        if (req.file) {
            sets.push('image_url=?');
            params.push(req.file.path || req.file.secure_url);
        }
        params.push(id);
        await db.query(`UPDATE categories SET ${sets.join(',')} WHERE category_id=?`, params);
        res.json({ message: 'Cập nhật danh mục thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const deleteCategory = async (req, res) => {
    try {
        const [[{ cnt }]] = await db.query(
            'SELECT COUNT(*) as cnt FROM products WHERE category_id=? AND is_active=1', [req.params.id]);
        if (cnt > 0) return res.status(400).json({ message: 'Danh mục đang có sản phẩm, không thể xóa!' });
        await db.query('DELETE FROM categories WHERE category_id=?', [req.params.id]);
        res.json({ message: 'Đã xóa danh mục!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };