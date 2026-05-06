const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// LẤY TẤT CẢ DANH MỤC
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY category_id');
        res.json(categories);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// THÊM DANH MỤC
const createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;
        let image_url = req.body.image_url || null;

        // Nếu có upload ảnh
        if (req.files && req.files.image) {
            const img     = req.files.image;
            const ext     = path.extname(img.name).toLowerCase();
            const fileName = 'category_' + Date.now() + ext;
            const saveDir  = path.join(__dirname, '../public/images/categories');
            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
            await img.mv(path.join(saveDir, fileName));
            image_url = '/images/categories/' + fileName;
        }

        const [result] = await db.query(
            'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
            [category_name, description, image_url]
        );
        res.status(201).json({ message: 'Thêm danh mục thành công!', category_id: result.insertId });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// SỬA DANH MỤC
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;
        let image_url = req.body.image_url || null;

        // Nếu có upload ảnh mới
        if (req.files && req.files.image) {
            const img      = req.files.image;
            const ext      = path.extname(img.name).toLowerCase();
            const fileName = 'category_' + Date.now() + ext;
            const saveDir  = path.join(__dirname, '../public/images/categories');
            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
            await img.mv(path.join(saveDir, fileName));
            image_url = '/images/categories/' + fileName;
        }

        let sql    = 'UPDATE categories SET category_name=?, description=?';
        const params = [category_name, description];
        if (image_url) { sql += ', image_url=?'; params.push(image_url); }
        sql += ' WHERE category_id=?';
        params.push(id);

        await db.query(sql, params);
        res.json({ message: 'Cập nhật danh mục thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// XÓA DANH MỤC
const deleteCategory = async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
        res.json({ message: 'Xóa danh mục thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
