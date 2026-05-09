const db = require('../config/db');

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*,
                COUNT(DISTINCT c.class_id) AS total_classes,
                COUNT(DISTINCT CASE WHEN c.status='ongoing' THEN c.class_id END) AS active_classes
            FROM teachers t
            LEFT JOIN classes c ON t.teacher_id = c.teacher_id
            GROUP BY t.teacher_id
            ORDER BY t.created_at DESC`);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getById = async (req, res) => {
    try {
        const [[teacher]] = await db.query('SELECT * FROM teachers WHERE teacher_id = ?', [req.params.id]);
        if (!teacher) return res.status(404).json({ message: 'Không tìm thấy giáo viên!' });

        const [classes] = await db.query(`
            SELECT c.*, co.course_name,
                COUNT(e.enrollment_id) AS student_count
            FROM classes c
            JOIN courses co ON c.course_id = co.course_id
            LEFT JOIN enrollments e ON c.class_id = e.class_id AND e.status = 'active'
            WHERE c.teacher_id = ?
            GROUP BY c.class_id
            ORDER BY c.start_date DESC`, [req.params.id]);

        res.json({ ...teacher, classes });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const create = async (req, res) => {
    try {
        const { full_name, email, phone, specialty, degree, experience_years, bio, salary, salary_type, join_date } = req.body;
        if (!full_name || !email || !specialty) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });

        const avatar = req.file ? `/images/teachers/${req.file.filename}` : null;
        const [result] = await db.query(
            `INSERT INTO teachers (full_name,email,phone,specialty,degree,experience_years,bio,salary,salary_type,join_date,avatar)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [full_name, email, phone, specialty, degree, experience_years||0, bio, salary||0, salary_type||'per_session', join_date||null, avatar]
        );
        res.status(201).json({ message: 'Thêm giáo viên thành công!', teacher_id: result.insertId });
    } catch(e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email đã tồn tại!' });
        res.status(500).json({ message: 'Lỗi server!', error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = ['full_name','email','phone','specialty','degree','experience_years','bio','salary','salary_type','join_date','is_active'];
        const sets = [], vals = [];
        fields.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); } });
        if (req.file) { sets.push('avatar=?'); vals.push(`/images/teachers/${req.file.filename}`); }
        if (!sets.length) return res.status(400).json({ message: 'Không có dữ liệu cập nhật!' });
        vals.push(id);
        await db.query(`UPDATE teachers SET ${sets.join(',')} WHERE teacher_id=?`, vals);
        res.json({ message: 'Cập nhật giáo viên thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const remove = async (req, res) => {
    try {
        const [[{ cnt }]] = await db.query(
            `SELECT COUNT(*) as cnt FROM classes WHERE teacher_id=? AND status IN ('upcoming','ongoing')`,
            [req.params.id]
        );
        if (cnt > 0) return res.status(400).json({ message: 'Giáo viên đang phụ trách lớp học, không thể xóa!' });
        await db.query('DELETE FROM teachers WHERE teacher_id=?', [req.params.id]);
        res.json({ message: 'Đã xóa giáo viên!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

module.exports = { getAll, getById, create, update, remove };
