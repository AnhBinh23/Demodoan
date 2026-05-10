// Lấy tất cả ca (work slots)
const getSlots = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM work_slots WHERE is_active=1 ORDER BY slot_order');
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// Lấy bảng chấm công 1 ngày — trả về lưới giáo viên × slot
const getByDate = async (req, res) => {
    try {
        const { date } = req.params; // YYYY-MM-DD

        // Danh sách giáo viên đang làm
        const [teachers] = await db.query(
            `SELECT t.teacher_id, t.full_name, t.avatar, i.name AS instrument, i.icon
             FROM teachers t
             LEFT JOIN instruments i ON t.instrument_id = i.instrument_id
             WHERE t.is_active = 1 ORDER BY t.full_name`);

        // Các ca làm
        const [slots] = await db.query(
            'SELECT * FROM work_slots WHERE is_active=1 ORDER BY slot_order');

        // Dữ liệu chấm công của ngày này
        const [records] = await db.query(
            `SELECT tk.teacher_id, tk.slot_id, tk.status, tk.note
             FROM teacher_timekeeping tk
             WHERE tk.work_date = ?`, [date]);

        // Map nhanh: "teacher_id-slot_id" → record
        const map = {};
        records.forEach(r => { map[`${r.teacher_id}-${r.slot_id}`] = r; });

        res.json({ date, teachers, slots, map });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// Lưu / cập nhật chấm công (1 ô)
const saveRecord = async (req, res) => {
    try {
        const { teacher_id, work_date, slot_id, status, note } = req.body;
        if (!teacher_id || !work_date || !slot_id)
            return res.status(400).json({ message: 'Thiếu thông tin!' });

        await db.query(
            `INSERT INTO teacher_timekeeping
                (teacher_id, work_date, slot_id, status, note, created_by)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
                status=VALUES(status), note=VALUES(note),
                created_by=VALUES(created_by), updated_at=NOW()`,
            [teacher_id, work_date, slot_id, status || 'present', note || null, req.user.user_id]
        );
        res.json({ message: 'Lưu chấm công thành công!' });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// Lưu toàn bộ bảng chấm công 1 ngày (bulk save)
const saveDay = async (req, res) => {
    try {
        const { work_date, records } = req.body;
        // records = [{ teacher_id, slot_id, status, note }, ...]
        if (!work_date || !Array.isArray(records))
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });

        for (const r of records) {
            await db.query(
                `INSERT INTO teacher_timekeeping
                    (teacher_id, work_date, slot_id, status, note, created_by)
                 VALUES (?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                    status=VALUES(status), note=VALUES(note),
                    created_by=VALUES(created_by), updated_at=NOW()`,
                [r.teacher_id, work_date, r.slot_id,
                 r.status || 'present', r.note || null, req.user.user_id]
            );
        }
        res.json({ message: `Lưu chấm công ${records.length} bản ghi thành công!` });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// Thống kê chấm công 1 giáo viên trong tháng
const getTeacherMonthly = async (req, res) => {
    try {
        const { teacher_id, month } = req.params; // month = YYYY-MM
        const [rows] = await db.query(
            `SELECT tk.work_date, tk.slot_id, tk.status, tk.note,
                    ws.slot_label, ws.start_time, ws.end_time
             FROM teacher_timekeeping tk
             JOIN work_slots ws ON tk.slot_id = ws.slot_id
             WHERE tk.teacher_id = ?
               AND DATE_FORMAT(tk.work_date,'%Y-%m') = ?
             ORDER BY tk.work_date, ws.slot_order`,
            [teacher_id, month]
        );

        // Tổng hợp
        const summary = { present: 0, absent: 0, late: 0, leave: 0 };
        rows.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });

        res.json({ teacher_id, month, records: rows, summary });
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

// Thống kê tất cả giáo viên trong tháng
const getMonthlyOverview = async (req, res) => {
    try {
        const { month } = req.params;
        const [rows] = await db.query(
            `SELECT t.teacher_id, t.full_name, t.avatar, i.name AS instrument, i.icon,
                SUM(CASE WHEN tk.status='present' THEN 1 ELSE 0 END) AS present_slots,
                SUM(CASE WHEN tk.status='absent'  THEN 1 ELSE 0 END) AS absent_slots,
                SUM(CASE WHEN tk.status='late'    THEN 1 ELSE 0 END) AS late_slots,
                SUM(CASE WHEN tk.status='leave'   THEN 1 ELSE 0 END) AS leave_slots,
                COUNT(tk.record_id) AS total_slots,
                t.salary,
                t.salary_type
             FROM teachers t
             LEFT JOIN instruments i ON t.instrument_id = i.instrument_id
             LEFT JOIN teacher_timekeeping tk
                ON t.teacher_id = tk.teacher_id
               AND DATE_FORMAT(tk.work_date,'%Y-%m') = ?
             WHERE t.is_active = 1
             GROUP BY t.teacher_id
             ORDER BY t.full_name`,
            [month]
        );
        res.json(rows);
    } catch(e) { res.status(500).json({ message: 'Lỗi server!', error: e.message }); }
};

module.exports = { getSlots, getByDate, saveRecord, saveDay, getTeacherMonthly, getMonthlyOverview };
