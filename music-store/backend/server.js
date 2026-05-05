const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ ảnh tĩnh
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Phục vụ Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// =============================================
// ROUTES
// =============================================
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/sheets', require('./routes/sheets'));
app.use('/sheets', express.static(path.join(__dirname, 'public/sheets')));
// Route kiểm tra server
app.get('/', (req, res) => {
    res.json({ message: '🎵 Ascent-Music API đang chạy!' });
});

// =============================================
// KHỞI ĐỘNG SERVER
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📦 API endpoint:          http://localhost:${PORT}/api`);
});
