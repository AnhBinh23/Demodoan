const db = require('../config/db');

// THÊM ĐÁNH GIÁ
const createReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.user_id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5!' });
        }

        // Kiểm tra user đã mua sản phẩm này chưa
        const [purchased] = await db.query(`
            SELECT od.order_detail_id FROM order_details od
            JOIN orders o ON od.order_id = o.order_id
            WHERE o.user_id = ? AND od.product_id = ? AND o.status = 'delivered'
        `, [user_id, product_id]);

        if (!purchased.length) {
            return res.status(403).json({ message: 'Bạn cần mua và nhận sản phẩm này trước khi đánh giá!' });
        }

        // Kiểm tra đã đánh giá chưa
        const [existing] = await db.query(
            'SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi!' });
        }

        await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [product_id, user_id, rating, comment || null]
        );

        res.status(201).json({ message: 'Đánh giá thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// XÓA ĐÁNH GIÁ (user tự xóa hoặc admin)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';

        const [reviews] = await db.query('SELECT * FROM reviews WHERE review_id = ?', [id]);
        if (!reviews.length) return res.status(404).json({ message: 'Không tìm thấy đánh giá!' });

        if (!isAdmin && reviews[0].user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này!' });
        }

        await db.query('DELETE FROM reviews WHERE review_id = ?', [id]);
        res.json({ message: 'Đã xóa đánh giá!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// LẤY ĐÁNH GIÁ THEO SẢN PHẨM
const getReviewsByProduct = async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT r.*, u.full_name, u.avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.product_id]);

        const avg = reviews.length
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({ reviews, average: parseFloat(avg), total: reviews.length });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { createReview, deleteReview, getReviewsByProduct };