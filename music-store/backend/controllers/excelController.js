const ExcelJS = require('exceljs');
const db = require('../config/db');

const applyHeaderStyle = (row) => {
    row.eachCell(cell => {
        cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1a1a2e' } };
        cell.font = { bold:true, color:{ argb:'FFFFD700' }, size:11 };
        cell.alignment = { horizontal:'center', vertical:'middle' };
        cell.border = { bottom:{ style:'thin', color:{ argb:'FF333333' } } };
    });
    row.height = 28;
};

// XUẤT CHẤM CÔNG
const exportTimekeeping = async (req, res) => {
    try {
        const { month } = req.params;
        const [teachers] = await db.query(
            `SELECT t.teacher_id, t.full_name, i.name AS instrument, t.salary, t.salary_type
             FROM teachers t LEFT JOIN instruments i ON t.instrument_id=i.instrument_id
             WHERE t.is_active=1 ORDER BY t.full_name`);
        const [slots] = await db.query('SELECT * FROM work_slots WHERE is_active=1 ORDER BY slot_order');
        const [records] = await db.query(
            `SELECT teacher_id, DATE_FORMAT(work_date,'%Y-%m-%d') AS work_date, slot_id, status
             FROM teacher_timekeeping WHERE DATE_FORMAT(work_date,'%Y-%m')=?`, [month]);

        const map = {};
        records.forEach(r => { map[`${r.teacher_id}-${r.work_date}-${r.slot_id}`] = r.status; });

        const [y, m] = month.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const days = Array.from({length:daysInMonth},(_,i) => {
            const d = new Date(y, m-1, i+1);
            return { date: `${y}-${String(m).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`, label: String(i+1) };
        });

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Ascent-Music';

        // Sheet tổng kết
        const ws = wb.addWorksheet('Tổng kết tháng '+month);
        ws.columns = [
            {header:'Giáo viên',key:'name',width:24},
            {header:'Nhạc cụ',key:'inst',width:14},
            {header:'Có mặt',key:'present',width:10},
            {header:'Vắng',key:'absent',width:10},
            {header:'Đi trễ',key:'late',width:10},
            {header:'Nghỉ phép',key:'leave',width:12},
            {header:'Loại lương',key:'type',width:14},
            {header:'Đơn giá',key:'rate',width:16},
            {header:'Tổng lương',key:'total',width:16},
        ];
        applyHeaderStyle(ws.getRow(1));

        let grandTotal = 0;
        for (const t of teachers) {
            const counts = {present:0,absent:0,late:0,leave:0};
            records.filter(r=>r.teacher_id===t.teacher_id).forEach(r=>{ if(counts[r.status]!==undefined) counts[r.status]++; });
            const earned = t.salary_type==='per_session' ? counts.present*t.salary : t.salary;
            grandTotal += earned;
            const row = ws.addRow({
                name:t.full_name, inst:t.instrument||'—',
                present:counts.present, absent:counts.absent, late:counts.late, leave:counts.leave,
                type:t.salary_type==='per_session'?'Theo ca':'Cố định',
                rate:t.salary, total:earned
            });
            row.getCell('total').font = {bold:true,color:{argb:'FFFFD700'}};
            row.getCell('present').font = {color:{argb:'FF00cc66'}};
            row.getCell('absent').font = {color:{argb:'FFcc3333'}};
        }
        const sumRow = ws.addRow({name:'TỔNG CỘNG',total:grandTotal});
        sumRow.getCell('name').font = {bold:true};
        sumRow.getCell('total').font = {bold:true,color:{argb:'FFFFD700'}};

        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition',`attachment; filename=chamcong_${month}.xlsx`);
        await wb.xlsx.write(res);
    } catch(e) { res.status(500).json({ message:'Lỗi xuất Excel!', error:e.message }); }
};

// XUẤT HỌC VIÊN
const exportStudents = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.student_id, s.full_name, s.phone, s.email, s.date_of_birth,
                s.gender, s.address, s.parent_name, s.parent_phone,
                COUNT(DISTINCT e.enrollment_id) AS total_classes,
                COALESCE(SUM(e.final_amount),0) AS total_tuition,
                COALESCE(SUM(tp.amount),0) AS paid, s.created_at
            FROM students s
            LEFT JOIN enrollments e ON s.student_id=e.student_id
            LEFT JOIN tuition_payments tp ON e.enrollment_id=tp.enrollment_id
            WHERE s.is_active=1 GROUP BY s.student_id ORDER BY s.full_name`);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Danh sách học viên');
        ws.columns = [
            {header:'#',key:'stt',width:5},{header:'Họ và tên',key:'name',width:24},
            {header:'SĐT',key:'phone',width:14},{header:'Email',key:'email',width:26},
            {header:'Ngày sinh',key:'dob',width:14},{header:'Giới tính',key:'gender',width:10},
            {header:'Địa chỉ',key:'address',width:28},{header:'Phụ huynh',key:'parent',width:18},
            {header:'SĐT PH',key:'pphone',width:14},{header:'Số lớp',key:'classes',width:8},
            {header:'Học phí',key:'tuition',width:16},{header:'Đã đóng',key:'paid',width:16},
            {header:'Còn nợ',key:'debt',width:16},{header:'Tham gia',key:'joined',width:14},
        ];
        applyHeaderStyle(ws.getRow(1));
        rows.forEach((r,i) => {
            const debt = (r.total_tuition||0)-(r.paid||0);
            const row = ws.addRow({
                stt:i+1, name:r.full_name, phone:r.phone||'', email:r.email||'',
                dob:r.date_of_birth?new Date(r.date_of_birth).toLocaleDateString('vi-VN'):'',
                gender:r.gender==='male'?'Nam':r.gender==='female'?'Nữ':'Khác',
                address:r.address||'', parent:r.parent_name||'', pphone:r.parent_phone||'',
                classes:r.total_classes||0, tuition:r.total_tuition||0, paid:r.paid||0, debt,
                joined:new Date(r.created_at).toLocaleDateString('vi-VN'),
            });
            if (debt>0) row.getCell('debt').font={color:{argb:'FFcc3333'},bold:true};
            else row.getCell('debt').font={color:{argb:'FF00cc66'}};
        });
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition','attachment; filename=hocvien.xlsx');
        await wb.xlsx.write(res);
    } catch(e) { res.status(500).json({ message:'Lỗi xuất Excel!', error:e.message }); }
};

// XUẤT DOANH THU
const exportRevenue = async (req, res) => {
    try {
        const { month } = req.params;
        const [orders] = await db.query(`
            SELECT o.order_id, o.receiver_name, o.receiver_phone, o.total_amount,
                o.payment_method, o.status, o.created_at
            FROM orders o WHERE DATE_FORMAT(o.created_at,'%Y-%m')=? ORDER BY o.created_at`, [month]);
        const [tuitions] = await db.query(`
            SELECT s.full_name AS student_name, cl.class_name,
                tp.amount, tp.payment_method, tp.payment_date
            FROM tuition_payments tp
            JOIN enrollments e ON tp.enrollment_id=e.enrollment_id
            JOIN students s ON e.student_id=s.student_id
            JOIN classes cl ON e.class_id=cl.class_id
            WHERE DATE_FORMAT(tp.payment_date,'%Y-%m')=? ORDER BY tp.payment_date`, [month]);

        const wb = new ExcelJS.Workbook();
        const ws1 = wb.addWorksheet('Đơn hàng');
        ws1.columns = [
            {header:'#',key:'id',width:8},{header:'Khách hàng',key:'name',width:22},
            {header:'SĐT',key:'phone',width:14},{header:'Số tiền',key:'amount',width:18},
            {header:'Thanh toán',key:'pay',width:14},{header:'Trạng thái',key:'status',width:14},
            {header:'Ngày đặt',key:'date',width:14},
        ];
        applyHeaderStyle(ws1.getRow(1));
        let totalOrder = 0;
        orders.forEach(o => {
            ws1.addRow({id:'#'+o.order_id, name:o.receiver_name, phone:o.receiver_phone,
                amount:o.total_amount, pay:o.payment_method, status:o.status,
                date:new Date(o.created_at).toLocaleDateString('vi-VN')});
            if (o.status==='delivered') totalOrder += Number(o.total_amount);
        });
        ws1.addRow({id:'TỔNG (đã giao)',amount:totalOrder}).getCell('amount').font={bold:true,color:{argb:'FFFFD700'}};

        const ws2 = wb.addWorksheet('Thu học phí');
        ws2.columns = [
            {header:'Học viên',key:'name',width:22},{header:'Lớp học',key:'class',width:24},
            {header:'Số tiền',key:'amount',width:16},{header:'Hình thức',key:'pay',width:14},
            {header:'Ngày thu',key:'date',width:14},
        ];
        applyHeaderStyle(ws2.getRow(1));
        let totalTuition = 0;
        tuitions.forEach(t => {
            ws2.addRow({name:t.student_name, class:t.class_name, amount:t.amount, pay:t.payment_method, date:new Date(t.payment_date).toLocaleDateString('vi-VN')});
            totalTuition += Number(t.amount);
        });
        ws2.addRow({name:'TỔNG',amount:totalTuition}).getCell('amount').font={bold:true,color:{argb:'FFFFD700'}};

        const ws3 = wb.addWorksheet('Tổng hợp');
        ws3.addRow([`TỔNG KẾT DOANH THU THÁNG ${month}`]);
        ws3.getRow(1).font={bold:true,size:14,color:{argb:'FFFFD700'}};
        ws3.addRow([]);
        ws3.addRow(['Đơn hàng (đã giao)', totalOrder]);
        ws3.addRow(['Thu học phí', totalTuition]);
        const totalRow = ws3.addRow(['TỔNG CỘNG', totalOrder+totalTuition]);
        totalRow.font={bold:true,size:12,color:{argb:'FFFFD700'}};
        ws3.getColumn(1).width=30; ws3.getColumn(2).width=20;

        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition',`attachment; filename=doanhthu_${month}.xlsx`);
        await wb.xlsx.write(res);
    } catch(e) { res.status(500).json({ message:'Lỗi xuất Excel!', error:e.message }); }
};

module.exports = { exportTimekeeping, exportStudents, exportRevenue };
