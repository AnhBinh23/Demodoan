const db = require('../config/db');

const getAll = async (req, res) => {
    try {
        const { search, status } = req.query;
        let sql = `
            SELECT s.*,
                COUNT(DISTINCT e.enrollment_id) AS total_enrollments,
                COUNT(DISTINCT CASE WHEN e.status='active' THEN e.enrollment_id END) AS active_enrollments
            FROM students s
            LEFT JOIN enrollments e ON s.student_id = e.student_id
            WHERE 1=1`;
        const params = [];
        if (search) { sql += ' AND (s.full_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)'; const q = `%${search}%`; params.push(q,q,q); }
        if (status) { sql += ' AND s.status = ?'; params.push(status); }
        sql += ' GROUP BY s.student_id ORDER BY s.created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getById = async (req, res) => {
    try {
        const [[student]] = await db.query('SELECT * FROM students WHERE student_id=?', [req.params.id]);
        if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên!' });
        const [enrollments] = await db.query(`
            SELECT e.*, cl.class_name, cl.schedule_days, cl.schedule_time, cl.status AS class_status,
                co.course_name, t.full_name AS teacher_name
            FROM enrollments e
            JOIN classes cl ON e.class_id = cl.class_id
            JOIN courses co ON cl.course_id = co.course_id
            JOIN teachers t ON cl.teacher_id = t.teacher_id
            WHERE e.student_id = ?
            ORDER BY e.enrolled_at DESC`, [req.params.id]);
        res.json({ ...student, enrollments });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const create = async (req, res) => {
    try {
        const { full_name, phone, email, birth_date, gender, address, parent_name, parent_phone, notes } = req.body;
        if (!full_name) return res.status(400).json({ message: 'Họ tên là bắt buộc!' });
        const [result] = await db.query(
            `INSERT INTO students (full_name,phone,email,birth_date,gender,address,parent_name,parent_phone,notes)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [full_name, phone||null, email||null, birth_date||null, gender||null, address||null, parent_name||null, parent_phone||null, notes||null]
        );
        res.status(201).json({ message: 'Thêm học viên thành công!', student_id: result.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const update = async (req, res) => {
    try {
        const fields = ['full_name','phone','email','birth_date','gender','address','parent_name','parent_phone','notes','status'];
        const sets = [], vals = [];
        fields.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); } });
        if (!sets.length) return res.status(400).json({ message: 'Không có dữ liệu!' });
        vals.push(req.params.id);
        await db.query(`UPDATE students SET ${sets.join(',')} WHERE student_id=?`, vals);
        res.json({ message: 'Cập nhật học viên thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const remove = async (req, res) => {
    try {
        await db.query("UPDATE students SET status='inactive' WHERE student_id=?", [req.params.id]);
        res.json({ message: 'Đã vô hiệu hóa học viên!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

module.exports = { getAll, getById, create, update, remove };