const db = require('../config/db');

// LẤY GIỎ HÀNG
const getCart = async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT c.cart_id, c.quantity,
                   p.product_id, p.product_name, p.price, p.discount, p.image_url, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
        `, [req.user.user_id]);

        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// THÊM VÀO GIỎ HÀNG
const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.user_id;

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const [existing] = await db.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing.length > 0) {
            // Tăng số lượng
            await db.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, user_id, product_id]
            );
        } else {
            // Thêm mới
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );
        }

        res.json({ message: 'Đã thêm vào giỏ hàng!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// CẬP NHẬT SỐ LƯỢNG
const updateCart = async (req, res) => {
    try {
        const { cart_id } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            await db.query('DELETE FROM cart WHERE cart_id = ? AND user_id = ?',
                [cart_id, req.user.user_id]);
            return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
        }

        await db.query(
            'UPDATE cart SET quantity = ? WHERE cart_id = ? AND user_id = ?',
            [quantity, cart_id, req.user.user_id]
        );
        res.json({ message: 'Đã cập nhật giỏ hàng!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// XÓA KHỎI GIỎ HÀNG
const removeFromCart = async (req, res) => {
    try {
        const { cart_id } = req.params;
        await db.query('DELETE FROM cart WHERE cart_id = ? AND user_id = ?',
            [cart_id, req.user.user_id]);
        res.json({ message: 'Đã xóa khỏi giỏ hàng!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
