const db         = require('../config/db');
require('dotenv').config();

const getAllProducts = async (req, res) => {
    try {
        const { category_id, search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;
        let sql = `SELECT p.*, c.category_name FROM products p
                   JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = 1`;
        const params = [];
        if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
        if (search) { sql += ' AND (p.product_name LIKE ? OR p.brand LIKE ?)'; params.push('%'+search+'%','%'+search+'%'); }
        const [countRows] = await db.query(sql.replace('SELECT p.*, c.category_name','SELECT COUNT(*) as total'), params);
        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [products] = await db.query(sql, params);
        res.json({ products, total: countRows[0].total, page: parseInt(page), total_pages: Math.ceil(countRows[0].total / limit) });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const getProductById = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.category_name FROM products p
             JOIN categories c ON p.category_id = c.category_id
             WHERE p.product_id = ? AND p.is_active = 1`, [req.params.id]);
        if (!products.length) return res.status(404).json({ message: 'Không tìm thấy!' });
        const [images]  = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [req.params.id]);
        const [reviews] = await db.query(
            `SELECT r.*, u.full_name FROM reviews r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.product_id = ? ORDER BY r.created_at DESC`, [req.params.id]);
        res.json({ ...products[0], images, reviews });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const createProduct = async (req, res) => {
    try {
        const { category_id, product_name, description, price, discount, stock, brand } = req.body;
        let image_url = null;

        // Upload ảnh chính (CloudinaryStorage xử lý qua multer middleware)
        if (req.file) {
            image_url = req.file.path || req.file.secure_url;
        }

        const [result] = await db.query(
            'INSERT INTO products (category_id, product_name, description, price, discount, stock, brand, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, product_name, description, price, discount||0, stock||0, brand, image_url]
        );
        const product_id = result.insertId;

        res.status(201).json({ message: 'Thêm sản phẩm thành công!', product_id });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// ✅ FIX: Dùng req.files thay vì req.file (vì route dùng .fields())
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, product_name, description, price, discount, stock, brand, is_active } = req.body;

        let image_url = null;
        // Upload ảnh mới nếu có (CloudinaryStorage xử lý qua multer)
        if (req.file) {
            image_url = req.file.path || req.file.secure_url;
        }

        const sets   = ['category_id=?','product_name=?','description=?','price=?','discount=?','stock=?','brand=?','is_active=?'];
        const params = [category_id, product_name, description, price, discount||0, stock||0, brand, is_active ?? 1];

        if (image_url) { sets.push('image_url=?'); params.push(image_url); }
        params.push(id);

        await db.query(`UPDATE products SET ${sets.join(',')} WHERE product_id=?`, params);

        res.json({ message: 'Cập nhật sản phẩm thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const deleteProduct = async (req, res) => {
    try {
        await db.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [req.params.id]);
        res.json({ message: 'Xóa thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };