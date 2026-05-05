const db = require('../config/db');

// LẤY TẤT CẢ DANH MỤC
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY category_id');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// THÊM DANH MỤC (Admin)
const createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;
        const image_url = req.file ? `/images/categories/${req.file.filename}` : null;

        const [result] = await db.query(
            'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
            [category_name, description, image_url]
        );
        res.status(201).json({ message: 'Thêm danh mục thành công!', category_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// SỬA DANH MỤC (Admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;
        await db.query(
            'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
            [category_name, description, id]
        );
        res.json({ message: 'Cập nhật danh mục thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// XÓA DANH MỤC (Admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
        res.json({ message: 'Xóa danh mục thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
