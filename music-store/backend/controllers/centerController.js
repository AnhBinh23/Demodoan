const db = require('../config/db');
const bcrypt = require('bcryptjs');
const getInstruments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM instruments WHERE is_active=1 ORDER BY instrument_id');
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getCourseTypes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM course_types WHERE is_active=1 ORDER BY type_id');
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// COURSES
// =============================================
const getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT co.*, i.name AS instrument_name, i.icon AS instrument_icon,
                ct.type_name, ct.total_sessions, ct.students_per_class,
                COUNT(DISTINCT cl.class_id) AS total_classes
            FROM courses co
            LEFT JOIN instruments i  ON co.instrument_id = i.instrument_id
            LEFT JOIN course_types ct ON co.type_id = ct.type_id
            LEFT JOIN classes cl ON co.course_id = cl.course_id
            WHERE co.is_active = 1
            GROUP BY co.course_id
            ORDER BY co.instrument_id, co.type_id`);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const createCourse = async (req, res) => {
    try {
        const { course_name, instrument_id, type_id, level, description, tuition_fee } = req.body;
        if (!course_name || !tuition_fee) return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO courses (course_name, instrument_id, type_id, level, description, tuition_fee)
             VALUES (?,?,?,?,?,?)`,
            [course_name, instrument_id||null, type_id||null, level||'beginner', description||null, tuition_fee]
        );
        res.status(201).json({ message: 'Thêm khóa học thành công!', course_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const updateCourse = async (req, res) => {
    try {
        const fields = ['course_name','instrument_id','type_id','level','description','tuition_fee','is_active'];
        const sets = [], vals = [];
        fields.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); } });
        vals.push(req.params.id);
        await db.query(`UPDATE courses SET ${sets.join(',')} WHERE course_id=?`, vals);
        res.json({ message: 'Cập nhật khóa học thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const deleteCourse = async (req, res) => {
    try {
        const [[{cnt}]] = await db.query('SELECT COUNT(*) as cnt FROM classes WHERE course_id=?', [req.params.id]);
        if (cnt > 0) return res.status(400).json({ message: 'Khóa học đang có lớp, không thể xóa!' });
        await db.query('DELETE FROM courses WHERE course_id=?', [req.params.id]);
        res.json({ message: 'Đã xóa khóa học!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// CLASSES
// =============================================
const getAllClasses = async (req, res) => {
    try {
        const { status, teacher_id, course_id, instrument_id } = req.query;
        let sql = `
            SELECT cl.*, co.course_name, co.tuition_fee,
                ct.type_name, ct.total_sessions, ct.students_per_class,
                t.full_name AS teacher_name, t.phone AS teacher_phone,
                i.name AS instrument_name, i.icon AS instrument_icon,
                COUNT(DISTINCT e.enrollment_id) AS student_count,
                cl.max_students - COUNT(DISTINCT e.enrollment_id) AS available_slots
            FROM classes cl
            JOIN courses co ON cl.course_id = co.course_id
            LEFT JOIN course_types ct ON co.type_id = ct.type_id
            JOIN teachers t ON cl.teacher_id = t.teacher_id
            LEFT JOIN instruments i ON cl.instrument_id = i.instrument_id
            LEFT JOIN enrollments e ON cl.class_id = e.class_id AND e.status='active'
            WHERE 1=1`;
        const params = [];
        if (status)        { sql += ' AND cl.status=?';        params.push(status); }
        if (teacher_id)    { sql += ' AND cl.teacher_id=?';    params.push(teacher_id); }
        if (course_id)     { sql += ' AND cl.course_id=?';     params.push(course_id); }
        if (instrument_id) { sql += ' AND cl.instrument_id=?'; params.push(instrument_id); }
        sql += ' GROUP BY cl.class_id ORDER BY cl.start_date DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getClassDetail = async (req, res) => {
    try {
        const [[cls]] = await db.query(`
            SELECT cl.*, co.course_name, co.tuition_fee, co.sessions_total,
                ct.type_name, ct.total_sessions, ct.students_per_class,
                t.full_name AS teacher_name, t.phone AS teacher_phone,
                i.name AS instrument_name, i.icon AS instrument_icon
            FROM classes cl
            JOIN courses co ON cl.course_id = co.course_id
            LEFT JOIN course_types ct ON co.type_id = ct.type_id
            JOIN teachers t ON cl.teacher_id = t.teacher_id
            LEFT JOIN instruments i ON cl.instrument_id = i.instrument_id
            WHERE cl.class_id=?`, [req.params.id]);
        if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học!' });

        const [students] = await db.query(`
            SELECT s.student_id, s.full_name, s.phone, s.parent_phone,
                e.enrollment_id, e.status AS enroll_status, e.final_amount,
                COALESCE(SUM(tp.amount),0) AS paid_amount
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            LEFT JOIN tuition_payments tp ON e.enrollment_id = tp.enrollment_id
            WHERE e.class_id=? GROUP BY e.enrollment_id`, [req.params.id]);

        const [sessions] = await db.query(
            'SELECT * FROM class_sessions WHERE class_id=? ORDER BY session_date ASC', [req.params.id]);

        res.json({ ...cls, students, sessions });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const createClass = async (req, res) => {
    try {
        const { class_name, course_id, teacher_id, instrument_id, max_students, room, schedule_days, schedule_time, start_date, end_date } = req.body;
        if (!class_name || !course_id || !teacher_id || !start_date)
            return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO classes (class_name,course_id,teacher_id,instrument_id,max_students,room,schedule_days,schedule_time,start_date,end_date)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [class_name, course_id, teacher_id, instrument_id||null, max_students||3,
             room||null, schedule_days||null, schedule_time||null, start_date, end_date||null]
        );
        res.status(201).json({ message: 'Tạo lớp học thành công!', class_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const updateClass = async (req, res) => {
    try {
        const fields = ['class_name','course_id','teacher_id','instrument_id','max_students','room','schedule_days','schedule_time','start_date','end_date','status'];
        const sets = [], vals = [];
        fields.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); } });
        vals.push(req.params.id);
        await db.query(`UPDATE classes SET ${sets.join(',')} WHERE class_id=?`, vals);
        res.json({ message: 'Cập nhật lớp học thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// ENROLLMENTS
// =============================================
const enrollStudent = async (req, res) => {
    try {
        const { student_id, class_id, discount_amount, note } = req.body;
        if (!student_id || !class_id) return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [[cls]] = await db.query(`
            SELECT cl.max_students, co.tuition_fee,
                COUNT(e.enrollment_id) AS current_count
            FROM classes cl JOIN courses co ON cl.course_id=co.course_id
            LEFT JOIN enrollments e ON cl.class_id=e.class_id AND e.status='active'
            WHERE cl.class_id=? GROUP BY cl.class_id`, [class_id]);
        if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp!' });
        if (cls.current_count >= cls.max_students) return res.status(400).json({ message: 'Lớp đã đầy!' });
        const discount = parseFloat(discount_amount) || 0;
        const [r] = await db.query(
            `INSERT INTO enrollments (student_id,class_id,tuition_total,discount_amount,final_amount,note)
             VALUES (?,?,?,?,?,?)`,
            [student_id, class_id, cls.tuition_fee, discount, cls.tuition_fee - discount, note||null]
        );
        res.status(201).json({ message: 'Đăng ký học thành công!', enrollment_id: r.insertId });
    } catch(e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Học viên đã đăng ký lớp này!' });
        res.status(500).json({ message: 'Lỗi server!', error: e.message });
    }
};

const updateEnrollment = async (req, res) => {
    try {
        const { status, note } = req.body;
        await db.query('UPDATE enrollments SET status=?, note=? WHERE enrollment_id=?',
            [status, note||null, req.params.id]);
        res.json({ message: 'Cập nhật đăng ký thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// TUITION PAYMENTS
// =============================================
const addPayment = async (req, res) => {
    try {
        const { enrollment_id, amount, payment_date, payment_method, note } = req.body;
        if (!enrollment_id || !amount) return res.status(400).json({ message: 'Thiếu thông tin!' });
        await db.query(
            `INSERT INTO tuition_payments (enrollment_id,amount,payment_date,payment_method,note,created_by)
             VALUES (?,?,?,?,?,?)`,
            [enrollment_id, amount,
             payment_date || new Date().toISOString().split('T')[0],
             payment_method||'cash', note||null, req.user.user_id]
        );
        res.status(201).json({ message: 'Ghi nhận học phí thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getPaymentsByEnrollment = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tp.*, u.full_name AS created_by_name
             FROM tuition_payments tp
             LEFT JOIN users u ON tp.created_by=u.user_id
             WHERE tp.enrollment_id=? ORDER BY tp.payment_date DESC`,
            [req.params.enrollment_id]);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// SESSIONS & ATTENDANCE
// =============================================
const createSession = async (req, res) => {
    try {
        const { class_id, session_date, start_time, end_time, topic } = req.body;
        if (!class_id || !session_date || !start_time || !end_time)
            return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO class_sessions (class_id,session_date,start_time,end_time,topic)
             VALUES (?,?,?,?,?)`,
            [class_id, session_date, start_time, end_time, topic||null]
        );
        res.status(201).json({ message: 'Tạo buổi học thành công!', session_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const saveAttendance = async (req, res) => {
    try {
        const { session_id, records } = req.body;
        if (!session_id || !Array.isArray(records))
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });
        await db.query('UPDATE class_sessions SET status="done" WHERE session_id=?', [session_id]);
        for (const r of records) {
            await db.query(
                `INSERT INTO attendance (session_id,student_id,status,note) VALUES (?,?,?,?)
                 ON DUPLICATE KEY UPDATE status=VALUES(status), note=VALUES(note)`,
                [session_id, r.student_id, r.status||'present', r.note||null]
            );
        }
        res.json({ message: 'Lưu điểm danh thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getAttendanceBySession = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, s.full_name, s.phone FROM attendance a
             JOIN students s ON a.student_id=s.student_id
             WHERE a.session_id=?`, [req.params.session_id]);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getAttendanceByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, cs.session_date, cs.start_time, cs.end_time, cs.topic, cl.class_name
             FROM attendance a
             JOIN class_sessions cs ON a.session_id=cs.session_id
             JOIN classes cl ON cs.class_id=cl.class_id
             WHERE a.student_id=? ORDER BY cs.session_date DESC`, [req.params.student_id]);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// =============================================
// ADMIN PERMISSIONS
// =============================================
const getAdmins = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at,
                p.can_manage_products, p.can_manage_orders, p.can_manage_users,
                p.can_manage_teachers, p.can_manage_students, p.can_manage_classes,
                p.can_manage_finance, p.can_view_reports
            FROM users u
            LEFT JOIN admin_permissions p ON u.user_id=p.user_id
            WHERE u.role IN ('admin','staff','super_admin')
            ORDER BY FIELD(u.role,'super_admin','admin','staff'), u.created_at`);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const updateAdminPermissions = async (req, res) => {
    try {
        const { user_id, role, permissions } = req.body;
        if (!user_id) return res.status(400).json({ message: 'Thiếu user_id!' });
        if (role) await db.query('UPDATE users SET role=? WHERE user_id=?', [role, user_id]);
        if (permissions) {
            await db.query(
                `INSERT INTO admin_permissions
                    (user_id,can_manage_products,can_manage_orders,can_manage_users,
                     can_manage_teachers,can_manage_students,can_manage_classes,
                     can_manage_finance,can_view_reports)
                 VALUES (?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                    can_manage_products=VALUES(can_manage_products),
                    can_manage_orders=VALUES(can_manage_orders),
                    can_manage_users=VALUES(can_manage_users),
                    can_manage_teachers=VALUES(can_manage_teachers),
                    can_manage_students=VALUES(can_manage_students),
                    can_manage_classes=VALUES(can_manage_classes),
                    can_manage_finance=VALUES(can_manage_finance),
                    can_view_reports=VALUES(can_view_reports)`,
                [user_id,
                 permissions.can_manage_products?1:0, permissions.can_manage_orders?1:0,
                 permissions.can_manage_users?1:0,    permissions.can_manage_teachers?1:0,
                 permissions.can_manage_students?1:0, permissions.can_manage_classes?1:0,
                 permissions.can_manage_finance?1:0,  permissions.can_view_reports?1:0]
            );
        }
        res.json({ message: 'Cập nhật quyền thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

module.exports = {
    getInstruments, getCourseTypes,
    getAllCourses, createCourse, updateCourse, deleteCourse,
    getAllClasses, getClassDetail, createClass, updateClass,
    enrollStudent, updateEnrollment,
    addPayment, getPaymentsByEnrollment,
    createSession, saveAttendance, getAttendanceBySession, getAttendanceByStudent,
    getAdmins, updateAdminPermissions,
};