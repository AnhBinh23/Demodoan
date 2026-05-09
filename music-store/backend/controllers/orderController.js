const db = require('../config/db');

// ĐẶT HÀNG
const createOrder = async (req, res) => {
    const conn = await require('../config/db').getConnection();
    try {
        const { receiver_name, receiver_phone, shipping_address, payment_method, note } = req.body;
        const user_id = req.user.user_id;

        // Lấy giỏ hàng
        const [cartItems] = await conn.query(`
            SELECT c.quantity, p.product_id, p.product_name, p.price, p.discount, p.stock
            FROM cart c JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
        `, [user_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống!' });
        }

        // ✅ BUG 4 FIX: Kiểm tra tồn kho trước khi đặt hàng
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({
                    message: `Sản phẩm "${item.product_name}" chỉ còn ${item.stock} trong kho, không đủ số lượng yêu cầu (${item.quantity})!`
                });
            }
        }

        // Tính tổng tiền
        const total_amount = cartItems.reduce((sum, item) => {
            const finalPrice = item.price * (1 - item.discount / 100);
            return sum + finalPrice * item.quantity;
        }, 0);

        await conn.beginTransaction();

        // Tạo đơn hàng
        const [orderResult] = await conn.query(
            `INSERT INTO orders (user_id, receiver_name, receiver_phone, shipping_address, total_amount, payment_method, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, receiver_name, receiver_phone, shipping_address, total_amount, payment_method || 'cod', note]
        );
        const order_id = orderResult.insertId;

        // Thêm chi tiết đơn hàng
        for (const item of cartItems) {
            const finalPrice = item.price * (1 - item.discount / 100);
            await conn.query(
                `INSERT INTO order_details (order_id, product_id, product_name, price, quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [order_id, item.product_id, item.product_name, finalPrice, item.quantity]
            );
            // Trừ tồn kho
            await conn.query(
                'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Xóa giỏ hàng
        await conn.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

        await conn.commit();
        res.status(201).json({ message: 'Đặt hàng thành công!', order_id });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    } finally {
        conn.release();
    }
};

// LẤY DANH SÁCH ĐƠN HÀNG (của user)
const getMyOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.user_id]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// CHI TIẾT ĐƠN HÀNG
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.query(
            'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
            [id, req.user.user_id]
        );
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        }

        const [details] = await db.query(
            'SELECT * FROM order_details WHERE order_id = ?', [id]
        );

        res.json({ ...orders[0], details });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// HỦY ĐƠN HÀNG
const cancelOrder = async (req, res) => {
    const conn = await require('../config/db').getConnection();
    try {
        const { id } = req.params;
        const [orders] = await conn.query(
            'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
            [id, req.user.user_id]
        );
        if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        if (orders[0].status !== 'pending') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận!' });
        }

        await conn.beginTransaction();

        // ✅ BUG 3 FIX: Hoàn lại tồn kho khi hủy đơn
        const [details] = await conn.query(
            'SELECT product_id, quantity FROM order_details WHERE order_id = ?', [id]
        );
        for (const item of details) {
            await conn.query(
                'UPDATE products SET stock = stock + ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        await conn.query('UPDATE orders SET status = "cancelled" WHERE order_id = ?', [id]);

        await conn.commit();
        res.json({ message: 'Hủy đơn hàng thành công!' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    } finally {
        conn.release();
    }
};

// ADMIN: Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let sql = `SELECT o.*, u.full_name, u.email FROM orders o
                   JOIN users u ON o.user_id = u.user_id WHERE 1=1`;
        const params = [];
        if (status) { sql += ' AND o.status = ?'; params.push(status); }
        sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await db.query(sql, params);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// ADMIN: Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // ✅ SEC 3 FIX: Validate status hợp lệ
        const allowedStatus = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
        }

        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };