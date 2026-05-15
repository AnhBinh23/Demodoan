const mysql = require('mysql2/promise');
require('dotenv').config();

const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.MYSQLHOST;

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || process.env.MYSQLHOST,
    port:     process.env.DB_PORT     || process.env.MYSQLPORT     || 3306,
    user:     process.env.DB_USER     || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME     || process.env.MYSQLDATABASE,
    charset:  'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    ssl: isRailway ? { rejectUnauthorized: false } : false,
});

pool.getConnection()
    .then(conn => {
        console.log('✅ Kết nối MySQL thành công!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Kết nối MySQL thất bại:', err.message);
    });

module.exports = pool;
