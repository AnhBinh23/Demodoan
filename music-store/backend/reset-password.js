const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');
require('dotenv').config();

async function resetPasswords() {
    const db = await mysql.createConnection({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log('✅ Kết nối database thành công!');

    // Danh sách tài khoản cần reset
    const accounts = [
        { email: 'admin@musicstore.com', password: 'Admin@123' },
        { email: 'an@gmail.com',         password: 'User@123'  },
        { email: 'binh@gmail.com',       password: 'User@123'  },
    ];

    for (const acc of accounts) {
        const hash = await bcrypt.hash(acc.password, 10);
        await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hash, acc.email]
        );
        console.log(`✅ Reset mật khẩu: ${acc.email}  →  ${acc.password}`);
    }

    console.log('\n🎉 Xong! Bạn có thể đăng nhập với:');
    console.log('   Admin    : admin@musicstore.com  /  Admin@123');
    console.log('   Customer : an@gmail.com          /  User@123');

    await db.end();
}

resetPasswords().catch(console.error);