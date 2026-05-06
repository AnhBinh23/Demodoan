const db         = require('../config/db');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(buffer);
    });
};

const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY category_id');
        res.json(categories);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;
        let image_url = null;
        if (req.file && req.file.buffer) {
            const result = await uploadToCloudinary(req.file.buffer, 'ascent-music/categories');
            image_url = result.secure_url;
        }
        const [result] = await db.query(
            'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
            [category_name, description, image_url]
        );
        res.status(201).json({ message: 'Thêm danh mục thành công!', category_id: result.insertId });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;
        let sql = 'UPDATE categories SET category_name=?, description=?';
        const params = [category_name, description];
        if (req.file && req.file.buffer) {
            const result = await uploadToCloudinary(req.file.buffer, 'ascent-music/categories');
            sql += ', image_url=?';
            params.push(result.secure_url);
        }
        sql += ' WHERE category_id=?';
        params.push(id);
        await db.query(sql, params);
        res.json({ message: 'Cập nhật thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const deleteCategory = async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
        res.json({ message: 'Xóa thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };