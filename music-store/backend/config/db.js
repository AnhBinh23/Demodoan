const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Kiểm tra kết nối
pool.getConnection()
    .then(conn => {
        console.log('✅ Kết nối MySQL thành công!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Kết nối MySQL thất bại:', err.message);
    });

module.exports = pool;
