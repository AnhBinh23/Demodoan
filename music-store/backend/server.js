const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const app = express();

// CORS - cho phép tất cả origins (Railway cần)
app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/sheets', express.static(path.join(__dirname, 'public/sheets')));

// Serve frontend - tự tìm đường dẫn
const frontendPaths = [
    path.join(__dirname, '../frontend'),
    path.join(__dirname, '../../music-store/frontend'),
    path.join(__dirname, '../../frontend'),
];
const frontendPath = frontendPaths.find(p => fs.existsSync(p));
if (frontendPath) {
    app.use(express.static(frontendPath));
    console.log('📁 Frontend:', frontendPath);
}

// Routes API
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/cart',        require('./routes/cart'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/sheets',      require('./routes/sheets'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/stats',       require('./routes/stats'));
app.use('/api/news',        require('./routes/news'));
app.use('/api/center',      require('./routes/center'));
app.use('/api/timekeeping', require('./routes/timekeeping'));
app.use('/api/email',       require('./routes/email'));
app.use('/api/excel',       require('./routes/excel'));

app.get('/api', (req, res) => res.json({ message: '🎵 Ascent-Music API đang chạy!' }));

// Catch-all: trả về index.html cho SPA
if (frontendPath) {
    app.get('*', (req, res) => {
        const indexPath = path.join(frontendPath, 'index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else res.status(404).json({ message: 'Not found' });
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server tại: http://localhost:${PORT}`);
    console.log(`📦 API:        http://localhost:${PORT}/api`);
});
