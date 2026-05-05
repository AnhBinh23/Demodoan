const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// LẤY TẤT CẢ BẢN NHẠC
const getAllSheets = async (req, res) => {
    try {
        const { instrument, difficulty, search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let sql = 'SELECT * FROM sheet_music WHERE is_active = 1';
        const params = [];

        if (instrument)  { sql += ' AND instrument = ?';                          params.push(instrument); }
        if (difficulty)  { sql += ' AND difficulty = ?';                          params.push(difficulty); }
        if (search)      { sql += ' AND (title LIKE ? OR composer LIKE ?)';       params.push(`%${search}%`, `%${search}%`); }

        // Đếm tổng
        const [countResult] = await db.query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
        const total = countResult[0].total;

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [sheets] = await db.query(sql, params);
        res.json({ sheets, total, page: parseInt(page), total_pages: Math.ceil(total / limit) });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// LẤY CHI TIẾT BẢN NHẠC
const getSheetById = async (req, res) => {
    try {
        const { id } = req.params;
        const [sheets] = await db.query('SELECT * FROM sheet_music WHERE sheet_id = ? AND is_active = 1', [id]);
        if (!sheets.length) return res.status(404).json({ message: 'Không tìm thấy bản nhạc!' });

        // Tăng lượt xem
        await db.query('UPDATE sheet_music SET view_count = view_count + 1 WHERE sheet_id = ?', [id]);
        res.json(sheets[0]);
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// ADMIN: THÊM BẢN NHẠC
const createSheet = async (req, res) => {
    try {
        const { title, composer, instrument, difficulty, description, is_free } = req.body;

        if (!req.files?.sheet_file) return res.status(400).json({ message: 'Vui lòng upload file bản nhạc!' });

        const sheetFile    = req.files.sheet_file;
        const thumbnailFile = req.files?.thumbnail;

        const ext       = path.extname(sheetFile.name).toLowerCase();
        const fileType  = ext === '.pdf' ? 'pdf' : 'image';
        const fileName  = `sheet_${Date.now()}${ext}`;
        const uploadDir = path.join(__dirname, '../public/sheets');

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        await sheetFile.mv(path.join(uploadDir, fileName));

        let thumbnailUrl = null;
        if (thumbnailFile) {
            const thumbName = `thumb_${Date.now()}${path.extname(thumbnailFile.name)}`;
            await thumbnailFile.mv(path.join(__dirname, '../public/images/sheets', thumbName));
            thumbnailUrl = `/images/sheets/${thumbName}`;
        }

        const [result] = await db.query(
            `INSERT INTO sheet_music (title, composer, instrument, difficulty, description, file_url, file_type, thumbnail_url, is_free)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, composer, instrument, difficulty || 'beginner', description, `/sheets/${fileName}`, fileType, thumbnailUrl, is_free ?? 1]
        );

        res.status(201).json({ message: 'Thêm bản nhạc thành công!', sheet_id: result.insertId });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// ADMIN: SỬA BẢN NHẠC
const updateSheet = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, composer, instrument, difficulty, description, is_free, is_active } = req.body;
        await db.query(
            `UPDATE sheet_music SET title=?, composer=?, instrument=?, difficulty=?, description=?, is_free=?, is_active=? WHERE sheet_id=?`,
            [title, composer, instrument, difficulty, description, is_free, is_active, id]
        );
        res.json({ message: 'Cập nhật thành công!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

// ADMIN: XÓA BẢN NHẠC
const deleteSheet = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE sheet_music SET is_active = 0 WHERE sheet_id = ?', [id]);
        res.json({ message: 'Đã xóa bản nhạc!' });
    } catch(err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAllSheets, getSheetById, createSheet, updateSheet, deleteSheet };
