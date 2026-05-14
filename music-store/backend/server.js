const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/sheets', express.static(path.join(__dirname, 'public/sheets')));
app.use(express.static(path.join(__dirname, '../frontend')));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📦 API endpoint:          http://localhost:${PORT}/api`);
});