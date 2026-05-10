const db = require('../config/db');
const { sendEnrollConfirm, sendTuitionReminder } = require('../config/email');

const resendEnrollEmail = async (req, res) => {
    try {
        const [[row]] = await db.query(`
            SELECT s.email, s.full_name AS student_name,
                cl.class_name, cl.schedule_days, cl.schedule_time, cl.room, cl.start_date,
                co.course_name, t.full_name AS teacher_name, e.final_amount
            FROM enrollments e
            JOIN students s ON e.student_id=s.student_id
            JOIN classes cl ON e.class_id=cl.class_id
            JOIN courses co ON cl.course_id=co.course_id
            JOIN teachers t ON cl.teacher_id=t.teacher_id
            WHERE e.enrollment_id=?`, [req.params.enrollment_id]);
        if (!row) return res.status(404).json({ message: 'Không tìm thấy!' });
        if (!row.email) return res.status(400).json({ message: 'Học viên chưa có email!' });
        await sendEnrollConfirm(row);
        res.json({ message: `Đã gửi email đến ${row.email}` });
    } catch(e) { res.status(500).json({ message: 'Lỗi gửi email!', error: e.message }); }
};

const sendDebtReminder = async (req, res) => {
    try {
        const [[row]] = await db.query(`
            SELECT s.email, s.full_name AS student_name, cl.class_name,
                e.final_amount - COALESCE(SUM(tp.amount),0) AS debt_amount
            FROM enrollments e
            JOIN students s ON e.student_id=s.student_id
            JOIN classes cl ON e.class_id=cl.class_id
            LEFT JOIN tuition_payments tp ON e.enrollment_id=tp.enrollment_id
            WHERE e.enrollment_id=? GROUP BY e.enrollment_id`, [req.params.enrollment_id]);
        if (!row) return res.status(404).json({ message: 'Không tìm thấy!' });
        if (!row.email) return res.status(400).json({ message: 'Học viên chưa có email!' });
        if (row.debt_amount <= 0) return res.status(400).json({ message: 'Học viên đã đóng đủ học phí!' });
        await sendTuitionReminder(row);
        res.json({ message: `Đã gửi nhắc học phí đến ${row.email}` });
    } catch(e) { res.status(500).json({ message: 'Lỗi gửi email!', error: e.message }); }
};

const sendBulkDebtReminder = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.email, s.full_name AS student_name, cl.class_name,
                e.final_amount - COALESCE(SUM(tp.amount),0) AS debt_amount
            FROM enrollments e
            JOIN students s ON e.student_id=s.student_id
            JOIN classes cl ON e.class_id=cl.class_id
            LEFT JOIN tuition_payments tp ON e.enrollment_id=tp.enrollment_id
            WHERE e.status='active' GROUP BY e.enrollment_id
            HAVING debt_amount > 0 AND s.email IS NOT NULL`);
        let sent = 0, failed = 0;
        for (const row of rows) {
            try { await sendTuitionReminder(row); sent++; }
            catch { failed++; }
        }
        res.json({ message: `Đã gửi ${sent} email, thất bại ${failed}` });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

module.exports = { resendEnrollEmail, sendDebtReminder, sendBulkDebtReminder };
