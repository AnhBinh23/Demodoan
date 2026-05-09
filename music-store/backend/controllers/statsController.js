const db = require('../config/db');

// THỐNG KÊ TỔNG QUAN
const getStats = async (req, res) => {
    try {
        const [[{ total_products }]] = await db.query(
            'SELECT COUNT(*) as total_products FROM products WHERE is_active = 1'
        );
        const [[{ total_orders }]] = await db.query(
            'SELECT COUNT(*) as total_orders FROM orders'
        );
        const [[{ total_users }]] = await db.query(
            'SELECT COUNT(*) as total_users FROM users WHERE role = "customer"'
        );
        const [[{ total_revenue }]] = await db.query(
            'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = "delivered"'
        );
        const [[{ pending_orders }]] = await db.query(
            'SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"'
        );
        const [[{ low_stock }]] = await db.query(
            'SELECT COUNT(*) as low_stock FROM products WHERE stock <= 5 AND is_active = 1'
        );

        res.json({
            total_products,
            total_orders,
            total_users,
            total_revenue: Number(total_revenue),
            pending_orders,
            low_stock
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// DOANH THU THEO THÁNG (12 tháng gần nhất)
const getRevenueByMonth = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                SUM(total_amount)                AS revenue,
                COUNT(*)                         AS orders
            FROM orders
            WHERE status = 'delivered'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// TOP SẢN PHẨM BÁN CHẠY
const getTopProducts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                p.product_id, p.product_name, p.image_url, p.price,
                SUM(od.quantity)               AS total_sold,
                SUM(od.quantity * od.price)    AS revenue
            FROM order_details od
            JOIN products p ON od.product_id = p.product_id
            JOIN orders o   ON od.order_id   = o.order_id
            WHERE o.status = 'delivered'
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = { getStats, getRevenueByMonth, getTopProducts };