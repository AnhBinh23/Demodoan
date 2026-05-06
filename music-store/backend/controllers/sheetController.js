const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

const getAllSheets = async (req, res) => {
    try {
        const { instrument, difficulty, search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;
        let sql = 'SELECT * FROM sheet_music WHERE is_active = 1';
        const params = [];
        if (instrument) { sql += ' AND instrument = ?'; params.push(instrument); }
        if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
        if (search)     { sql += ' AND (title LIKE ? OR composer LIKE ?)'; params.push('%'+search+'%','%'+search+'%'); }
        const [countResult] = await db.query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [sheets] = await db.query(sql, params);
        res.json({ sheets, total: countResult[0].total, page: parseInt(page), total_pages: Math.ceil(countResult[0].total / limit) });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const getSheetById = async (req, res) => {
    try {
        const [sheets] = await db.query('SELECT * FROM sheet_music WHERE sheet_id = ? AND is_active = 1', [req.params.id]);
        if (!sheets.length) return res.status(404).json({ message: 'Không tìm thấy bản nhạc!' });
        await db.query('UPDATE sheet_music SET view_count = view_count + 1 WHERE sheet_id = ?', [req.params.id]);
        res.json(sheets[0]);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const createSheet = async (req, res) => {
    try {
        const { title, composer, instrument, difficulty, description, is_free } = req.body;

        if (!req.files || !req.files.sheet_file) {
            return res.status(400).json({ message: 'Vui lòng upload file bản nhạc!' });
        }

        const sheetFile = req.files.sheet_file;
        const ext       = path.extname(sheetFile.name).toLowerCase();
        const fileType  = ext === '.pdf' ? 'pdf' : 'image';
        const fileName  = 'sheet_' + Date.now() + ext;

        // Thư mục lưu file
        const sheetsDir = path.join(__dirname, '../public/sheets');
        const imgDir    = path.join(__dirname, '../public/images/sheets');
        if (!fs.existsSync(sheetsDir)) fs.mkdirSync(sheetsDir, { recursive: true });
        if (!fs.existsSync(imgDir))    fs.mkdirSync(imgDir,    { recursive: true });

        // Lưu file vào đúng thư mục
        const savePath = fileType === 'pdf'
            ? path.join(sheetsDir, fileName)
            : path.join(imgDir, fileName);
        await sheetFile.mv(savePath);

        const fileUrl = fileType === 'pdf'
            ? '/sheets/' + fileName
            : '/images/sheets/' + fileName;

        // Ảnh bìa
        let thumbnailUrl = null;
        if (req.files && req.files.thumbnail) {
            const thumb     = req.files.thumbnail;
            const thumbName = 'thumb_' + Date.now() + path.extname(thumb.name);
            await thumb.mv(path.join(imgDir, thumbName));
            thumbnailUrl = '/images/sheets/' + thumbName;
        }

        const [result] = await db.query(
            'INSERT INTO sheet_music (title, composer, instrument, difficulty, description, file_url, file_type, thumbnail_url, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, composer||null, instrument||'Piano', difficulty||'beginner', description||null, fileUrl, fileType, thumbnailUrl, is_free??1]
        );

        res.status(201).json({ message: 'Thêm bản nhạc thành công!', sheet_id: result.insertId });
    } catch(err) {
        console.error('createSheet error:', err.message);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

const updateSheet = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, composer, instrument, difficulty, description, is_free, is_active } = req.body;
        await db.query(
            'UPDATE sheet_music SET title=?, composer=?, instrument=?, difficulty=?, description=?, is_free=?, is_active=? WHERE sheet_id=?',
            [title, composer, instrument, difficulty, description, is_free??1, is_active??1, id]
        );
        res.json({ message: 'Cập nhật thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

const deleteSheet = async (req, res) => {
    try {
        await db.query('UPDATE sheet_music SET is_active = 0 WHERE sheet_id = ?', [req.params.id]);
        res.json({ message: 'Đã xóa bản nhạc!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet };
