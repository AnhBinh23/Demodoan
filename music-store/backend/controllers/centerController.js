const db = require('../config/db');

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

const getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT co.*, COUNT(DISTINCT cl.class_id) AS total_classes
            FROM courses co
            LEFT JOIN classes cl ON co.course_id = cl.course_id
            WHERE co.is_active = 1
            GROUP BY co.course_id ORDER BY co.created_at DESC`);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const createCourse = async (req, res) => {
    try {
        const { course_name, level, description, tuition_fee, duration_months, sessions_total } = req.body;
        if (!course_name || !tuition_fee) return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO courses (course_name,level,description,tuition_fee,duration_months,sessions_total)
             VALUES (?,?,?,?,?,?)`,
            [course_name, level||'beginner', description||null, tuition_fee, duration_months||3, sessions_total||0]
        );
        res.status(201).json({ message: 'Thêm khóa học thành công!', course_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const updateCourse = async (req, res) => {
    try {
        const fields = ['course_name','level','description','tuition_fee','duration_months','sessions_total','is_active'];
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

const getAllClasses = async (req, res) => {
    try {
        const { status, teacher_id, course_id } = req.query;
        let sql = `
            SELECT cl.*, co.course_name, co.tuition_fee, co.sessions_total,
                t.full_name AS teacher_name, t.phone AS teacher_phone,
                COUNT(DISTINCT e.enrollment_id) AS student_count,
                cl.max_students - COUNT(DISTINCT e.enrollment_id) AS available_slots
            FROM classes cl
            JOIN courses co ON cl.course_id = co.course_id
            JOIN teachers t ON cl.teacher_id = t.teacher_id
            LEFT JOIN enrollments e ON cl.class_id = e.class_id AND e.status='active'
            WHERE 1=1`;
        const params = [];
        if (status)     { sql += ' AND cl.status=?';     params.push(status); }
        if (teacher_id) { sql += ' AND cl.teacher_id=?'; params.push(teacher_id); }
        if (course_id)  { sql += ' AND cl.course_id=?';  params.push(course_id); }
        sql += ' GROUP BY cl.class_id ORDER BY cl.start_date DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getClassDetail = async (req, res) => {
    try {
        const [[cls]] = await db.query(`
            SELECT cl.*, co.course_name, co.tuition_fee, co.sessions_total,
                t.full_name AS teacher_name, t.phone AS teacher_phone
            FROM classes cl
            JOIN courses co ON cl.course_id = co.course_id
            JOIN teachers t ON cl.teacher_id = t.teacher_id
            WHERE cl.class_id=?`, [req.params.id]);
        if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học!' });

        const [students] = await db.query(`
            SELECT s.student_id, s.full_name, s.phone, s.parent_phone,
                e.enrollment_id, e.status AS enroll_status,
                COALESCE(SUM(tp.amount),0) AS paid_amount
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            LEFT JOIN tuition_payments tp ON tp.student_id=e.student_id AND tp.class_id=e.class_id
            WHERE e.class_id=? GROUP BY e.enrollment_id`, [req.params.id]);

        const [sessions] = await db.query(
            'SELECT * FROM class_sessions WHERE class_id=? ORDER BY session_date ASC', [req.params.id]);

        res.json({ ...cls, students, sessions });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const createClass = async (req, res) => {
    try {
        const { class_name, course_id, teacher_id, max_students, room, schedule_days, schedule_time, start_date, end_date } = req.body;
        if (!class_name || !course_id || !teacher_id || !start_date)
            return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO classes (class_name,course_id,teacher_id,max_students,room,schedule_days,schedule_time,start_date,end_date)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [class_name, course_id, teacher_id, max_students||3, room||null, schedule_days||null, schedule_time||null, start_date, end_date||null]
        );
        res.status(201).json({ message: 'Tạo lớp học thành công!', class_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const updateClass = async (req, res) => {
    try {
        const fields = ['class_name','course_id','teacher_id','max_students','room','schedule_days','schedule_time','start_date','end_date','status'];
        const sets = [], vals = [];
        fields.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); } });
        vals.push(req.params.id);
        await db.query(`UPDATE classes SET ${sets.join(',')} WHERE class_id=?`, vals);
        res.json({ message: 'Cập nhật lớp học thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const enrollStudent = async (req, res) => {
    try {
        const { student_id, class_id } = req.body;
        if (!student_id || !class_id) return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [[cls]] = await db.query(`
            SELECT cl.max_students, COUNT(e.enrollment_id) AS current_count
            FROM classes cl
            LEFT JOIN enrollments e ON cl.class_id=e.class_id AND e.status='active'
            WHERE cl.class_id=? GROUP BY cl.class_id`, [class_id]);
        if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp!' });
        if (cls.current_count >= cls.max_students) return res.status(400).json({ message: 'Lớp đã đầy!' });
        const [r] = await db.query(
            `INSERT INTO enrollments (student_id,class_id) VALUES (?,?)`,
            [student_id, class_id]
        );
        res.status(201).json({ message: 'Đăng ký học thành công!', enrollment_id: r.insertId });
    } catch(e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Học viên đã đăng ký lớp này!' });
        res.status(500).json({ message: 'Lỗi server!', error: e.message });
    }
};

const updateEnrollment = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE enrollments SET status=? WHERE enrollment_id=?', [status, req.params.id]);
        res.json({ message: 'Cập nhật đăng ký thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const addPayment = async (req, res) => {
    try {
        const { student_id, class_id, amount, due_date, note } = req.body;
        if (!student_id || !class_id || !amount) return res.status(400).json({ message: 'Thiếu thông tin!' });
        await db.query(
            `INSERT INTO tuition_payments (student_id,class_id,amount,paid_at,due_date,status,note)
             VALUES (?,?,?,NOW(),?,'paid',?)`,
            [student_id, class_id, amount, due_date||null, note||null]
        );
        res.status(201).json({ message: 'Ghi nhận học phí thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const getPaymentsByEnrollment = async (req, res) => {
    try {
        const [[enrollment]] = await db.query(
            'SELECT student_id, class_id FROM enrollments WHERE enrollment_id=?', [req.params.enrollment_id]);
        if (!enrollment) return res.status(404).json({ message: 'Không tìm thấy đăng ký!' });
        const [rows] = await db.query(
            `SELECT * FROM tuition_payments WHERE student_id=? AND class_id=? ORDER BY paid_at DESC`,
            [enrollment.student_id, enrollment.class_id]);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const createSession = async (req, res) => {
    try {
        const { class_id, session_date, slot_id, topic } = req.body;
        if (!class_id || !session_date) return res.status(400).json({ message: 'Thiếu thông tin!' });
        const [r] = await db.query(
            `INSERT INTO class_sessions (class_id,session_date,slot_id,topic) VALUES (?,?,?,?)`,
            [class_id, session_date, slot_id||null, topic||null]
        );
        res.status(201).json({ message: 'Tạo buổi học thành công!', session_id: r.insertId });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

const saveAttendance = async (req, res) => {
    try {
        const { session_id, records } = req.body;
        if (!session_id || !Array.isArray(records))
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });
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
            `SELECT a.*, cs.session_date, cs.topic, cl.class_name
             FROM attendance a
             JOIN class_sessions cs ON a.session_id=cs.session_id
             JOIN classes cl ON cs.class_id=cl.class_id
             WHERE a.student_id=? ORDER BY cs.session_date DESC`, [req.params.student_id]);
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

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