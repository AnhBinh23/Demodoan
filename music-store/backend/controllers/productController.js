const db = require('../config/db');

// LẤY TẤT CẢ SẢN PHẨM
const getAllProducts = async (req, res) => {
    try {
        const { category_id, search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT p.*, c.category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
        `;
        const params = [];

        if (category_id) {
            sql += ' AND p.category_id = ?';
            params.push(category_id);
        }
        if (search) {
            sql += ' AND (p.product_name LIKE ? OR p.brand LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(sql, params);

        // Đếm tổng sản phẩm
        let countSql = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1';
        const countParams = [];
        if (category_id) { countSql += ' AND category_id = ?'; countParams.push(category_id); }

        const [countResult] = await db.query(countSql, countParams);

        res.json({
            products,
            total:       countResult[0].total,
            page:        parseInt(page),
            total_pages: Math.ceil(countResult[0].total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// LẤY CHI TIẾT SẢN PHẨM
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(`
            SELECT p.*, c.category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ? AND p.is_active = 1
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        }

        // Lấy ảnh sản phẩm
        const [images] = await db.query(
            'SELECT * FROM product_images WHERE product_id = ?', [id]
        );

        // Lấy đánh giá
        const [reviews] = await db.query(`
            SELECT r.*, u.full_name, u.avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [id]);

        res.json({ ...products[0], images, reviews });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// THÊM SẢN PHẨM (Admin)
const createProduct = async (req, res) => {
    try {
        const { category_id, product_name, description, price, discount, stock, brand } = req.body;
        const image_url = req.file ? `/images/products/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO products (category_id, product_name, description, price, discount, stock, brand, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, product_name, description, price, discount || 0, stock || 0, brand, image_url]
        );

        res.status(201).json({
            message: 'Thêm sản phẩm thành công!',
            product_id: result.insertId
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// SỬA SẢN PHẨM (Admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, product_name, description, price, discount, stock, brand, is_active } = req.body;

        await db.query(
            `UPDATE products SET category_id=?, product_name=?, description=?, price=?,
             discount=?, stock=?, brand=?, is_active=? WHERE product_id=?`,
            [category_id, product_name, description, price, discount, stock, brand, is_active, id]
        );

        res.json({ message: 'Cập nhật sản phẩm thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// XÓA SẢN PHẨM (Admin - ẩn đi)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [id]);
        res.json({ message: 'Xóa sản phẩm thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
