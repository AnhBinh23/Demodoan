const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const FROM = `"Ascent-Music 🎵" <${process.env.EMAIL_USER}>`;

const sendOrderConfirm = async ({ to, order_id, receiver_name, items, total_amount, shipping_address, payment_method }) => {
    if (!process.env.EMAIL_USER) return; // Bỏ qua nếu chưa cấu hình email
    const payLabel = { cod:'Thanh toán khi nhận hàng', banking:'Chuyển khoản', momo:'Ví MoMo', vnpay:'VNPay' };
    const rows = (items||[]).map(i => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.product_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:#c9a84c">${Number(i.price).toLocaleString('vi-VN')}₫</td>
        </tr>`).join('');

    const html = `
    <div style="background:#0e0e0e;color:#e8e3d5;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a1a1a,#111);padding:32px;text-align:center;border-bottom:2px solid #c9a84c">
        <div style="font-size:28px">🎵</div>
        <h1 style="color:#c9a84c;font-size:22px;margin:8px 0 4px">Ascent-Music</h1>
        <p style="color:#888;margin:0;font-size:13px">Xác nhận đơn hàng #${order_id}</p>
      </div>
      <div style="padding:28px">
        <p>Xin chào <strong style="color:#c9a84c">${receiver_name}</strong>,</p>
        <p style="color:#aaa;font-size:14px">Đơn hàng <strong>#${order_id}</strong> đặt thành công! Chúng tôi sẽ giao hàng sớm nhất.</p>
        <div style="background:#1a1a1a;border-radius:8px;overflow:hidden;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#222">
              <th style="padding:8px 12px;text-align:left;color:#888">Sản phẩm</th>
              <th style="padding:8px 12px;text-align:center;color:#888">SL</th>
              <th style="padding:8px 12px;text-align:right;color:#888">Giá</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="padding:12px;text-align:right;border-top:1px solid #333">
            Tổng: <strong style="color:#c9a84c">${Number(total_amount).toLocaleString('vi-VN')}₫</strong>
          </div>
        </div>
        <div style="background:#1a1a1a;border-radius:8px;padding:16px;font-size:13px">
          <p style="color:#c9a84c;font-weight:bold;margin:0 0 8px">📍 Giao hàng đến</p>
          <p style="margin:4px 0;color:#aaa">Địa chỉ: <span style="color:#e8e3d5">${shipping_address}</span></p>
          <p style="margin:4px 0;color:#aaa">Thanh toán: <span style="color:#e8e3d5">${payLabel[payment_method]||payment_method}</span></p>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;margin-top:20px">Cảm ơn bạn đã tin tưởng Ascent-Music! 🎶</p>
      </div>
      <div style="background:#111;padding:16px;text-align:center;font-size:12px;color:#555">© 2024 Ascent-Music</div>
    </div>`;

    await transporter.sendMail({ from: FROM, to, subject: `[Ascent-Music] Xác nhận đơn hàng #${order_id}`, html });
};

const sendEnrollConfirm = async ({ to, student_name, class_name, course_name, teacher_name, schedule_days, schedule_time, room, final_amount, start_date }) => {
    if (!process.env.EMAIL_USER) return;
    const dateStr = start_date ? new Date(start_date).toLocaleDateString('vi-VN') : '—';
    const html = `
    <div style="background:#0e0e0e;color:#e8e3d5;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a1a1a,#111);padding:32px;text-align:center;border-bottom:2px solid #c9a84c">
        <div style="font-size:28px">🎹</div>
        <h1 style="color:#c9a84c;font-size:22px;margin:8px 0 4px">Ascent-Music</h1>
        <p style="color:#888;margin:0;font-size:13px">Xác nhận đăng ký lớp học</p>
      </div>
      <div style="padding:28px">
        <p>Xin chào <strong style="color:#c9a84c">${student_name}</strong>,</p>
        <p style="color:#aaa;font-size:14px">Bạn đã đăng ký thành công lớp học tại <strong>Trung tâm âm nhạc Ascent-Music</strong>!</p>
        <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin:20px 0">
          <p style="color:#c9a84c;font-weight:bold;margin:0 0 12px">🎵 Thông tin lớp học</p>
          <table style="width:100%;font-size:13px">
            ${[['📚 Khóa học',course_name],['🏫 Tên lớp',class_name],['👨‍🏫 Giáo viên',teacher_name],
               ['🕐 Lịch học',`${schedule_days||'—'} · ${schedule_time||'—'}`],
               ['🚪 Phòng',room||'Sẽ thông báo'],['📅 Khai giảng',dateStr],
               ['💰 Học phí',`${Number(final_amount||0).toLocaleString('vi-VN')}₫`]]
              .map(([l,v])=>`<tr><td style="padding:5px 0;color:#888;width:40%">${l}</td><td style="padding:5px 0;color:#e8e3d5">${v}</td></tr>`).join('')}
          </table>
        </div>
        <div style="background:#1a1822;border:1px solid #3a3060;border-radius:8px;padding:16px;font-size:13px">
          <p style="color:#9b8fd4;font-weight:bold;margin:0 0 8px">📌 Lưu ý</p>
          <ul style="margin:0;padding-left:16px;color:#aaa;line-height:1.8">
            <li>Có mặt trước giờ học <strong style="color:#e8e3d5">15 phút</strong></li>
            <li>Mang theo <strong style="color:#e8e3d5">CMND/CCCD</strong> buổi đầu tiên</li>
          </ul>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;margin-top:20px">Chúc bạn học tốt! 🎶</p>
      </div>
      <div style="background:#111;padding:16px;text-align:center;font-size:12px;color:#555">© 2024 Ascent-Music</div>
    </div>`;
    await transporter.sendMail({ from: FROM, to, subject: `[Ascent-Music] Đăng ký lớp ${class_name} thành công`, html });
};

const sendTuitionReminder = async ({ to, student_name, class_name, debt_amount }) => {
    if (!process.env.EMAIL_USER) return;
    const html = `
    <div style="background:#0e0e0e;color:#e8e3d5;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a1a1a,#111);padding:28px;text-align:center;border-bottom:2px solid #e0541c">
        <div style="font-size:28px">💰</div>
        <h1 style="color:#e0541c;font-size:20px;margin:8px 0">Nhắc nhở học phí</h1>
      </div>
      <div style="padding:28px">
        <p>Xin chào <strong style="color:#c9a84c">${student_name}</strong>,</p>
        <p style="color:#aaa">Còn <strong style="color:#e0541c;font-size:16px">${Number(debt_amount).toLocaleString('vi-VN')}₫</strong> học phí chưa thanh toán cho lớp <strong>${class_name}</strong>.</p>
        <p style="color:#aaa;font-size:13px">Vui lòng thanh toán trước buổi học tiếp theo. Xin cảm ơn!</p>
      </div>
      <div style="background:#111;padding:16px;text-align:center;font-size:12px;color:#555">© 2024 Ascent-Music</div>
    </div>`;
    await transporter.sendMail({ from: FROM, to, subject: `[Ascent-Music] Nhắc học phí lớp ${class_name}`, html });
};

module.exports = { sendOrderConfirm, sendEnrollConfirm, sendTuitionReminder };
