-- =============================================
-- MỞ RỘNG: QUẢN LÝ TRUNG TÂM ÂM NHẠC
-- Thêm vào database: music_store
-- Chạy file này SAU khi đã có music_store_mysql.sql
-- =============================================

USE music_store;

-- =============================================
-- 10. BẢNG GIÁO VIÊN (teachers)
-- =============================================
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(15),
    avatar          VARCHAR(500),
    -- Thông tin chuyên môn
    specialty       VARCHAR(200)    NOT NULL,   -- VD: Piano, Guitar, Violin
    degree          VARCHAR(200),               -- Bằng cấp / Chứng chỉ
    experience_years INT            DEFAULT 0,  -- Số năm kinh nghiệm
    bio             TEXT,                       -- Giới thiệu bản thân
    -- Thông tin hành chính
    salary          DECIMAL(15,0)  DEFAULT 0,  -- Lương / buổi hoặc / tháng
    salary_type     ENUM('per_session','monthly') DEFAULT 'per_session',
    join_date       DATE,
    is_active       TINYINT(1)     DEFAULT 1,  -- 1: đang làm, 0: nghỉ
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 11. BẢNG KHÓA HỌC (courses)
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_name     VARCHAR(200)    NOT NULL,           -- VD: Piano cơ bản
    category_id     INT,                                -- Liên kết danh mục nhạc cụ
    level           ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description     TEXT,
    duration_months INT            DEFAULT 3,           -- Thời gian học (tháng)
    sessions_total  INT            DEFAULT 0,           -- Tổng số buổi học
    tuition_fee     DECIMAL(15,0)  NOT NULL,            -- Học phí (VNĐ)
    image_url       VARCHAR(500),
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- =============================================
-- 12. BẢNG LỚP HỌC (classes)
-- Một khóa học có thể có nhiều lớp
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
    class_id        INT AUTO_INCREMENT PRIMARY KEY,
    class_name      VARCHAR(150)    NOT NULL,           -- VD: Piano CĐ - T2,T4 sáng
    course_id       INT             NOT NULL,
    teacher_id      INT             NOT NULL,
    max_students    INT             DEFAULT 10,         -- Sĩ số tối đa
    room            VARCHAR(50),                        -- Phòng học: P.101, Online...
    -- Lịch học
    schedule_days   VARCHAR(100),                       -- VD: "Thứ 2, Thứ 4"
    schedule_time   VARCHAR(50),                        -- VD: "08:00 - 09:30"
    start_date      DATE            NOT NULL,
    end_date        DATE,
    status          ENUM('upcoming','ongoing','finished','cancelled') DEFAULT 'upcoming',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id)  REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- =============================================
-- 13. BẢNG HỌC VIÊN (students)
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    UNIQUE,
    phone           VARCHAR(15),
    date_of_birth   DATE,
    gender          ENUM('male','female','other'),
    address         VARCHAR(300),
    avatar          VARCHAR(500),
    -- Thông tin phụ huynh (nếu học viên dưới 18 tuổi)
    parent_name     VARCHAR(150),
    parent_phone    VARCHAR(15),
    -- Ghi chú
    note            TEXT,
    is_active       TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 14. BẢNG ĐĂNG KÝ HỌC (enrollments)
-- Học viên đăng ký lớp học
-- =============================================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT             NOT NULL,
    class_id        INT             NOT NULL,
    enroll_date     DATE            DEFAULT (CURRENT_DATE),
    status          ENUM('active','paused','completed','dropped') DEFAULT 'active',
    -- Học phí
    tuition_total   DECIMAL(15,0)   NOT NULL,           -- Tổng học phí lớp này
    discount_amount DECIMAL(15,0)   DEFAULT 0,          -- Số tiền được giảm
    final_amount    DECIMAL(15,0)   NOT NULL,            -- Thực đóng
    note            TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_class (student_id, class_id),  -- Mỗi học viên chỉ đăng ký 1 lần / lớp
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id)   REFERENCES classes(class_id)
);

-- =============================================
-- 15. BẢNG HỌC PHÍ (tuition_payments)
-- Theo dõi từng lần đóng tiền
-- =============================================
CREATE TABLE IF NOT EXISTS tuition_payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id   INT             NOT NULL,
    amount          DECIMAL(15,0)   NOT NULL,           -- Số tiền đóng lần này
    payment_date    DATE            DEFAULT (CURRENT_DATE),
    payment_method  ENUM('cash','banking','momo','vnpay') DEFAULT 'cash',
    note            TEXT,
    created_by      INT,                                -- admin_id tạo phiếu thu
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);

-- =============================================
-- 16. BẢNG LỊCH BUỔI HỌC (class_sessions)
-- Từng buổi học cụ thể
-- =============================================
CREATE TABLE IF NOT EXISTS class_sessions (
    session_id      INT AUTO_INCREMENT PRIMARY KEY,
    class_id        INT             NOT NULL,
    session_date    DATE            NOT NULL,           -- Ngày học
    start_time      TIME            NOT NULL,           -- Giờ bắt đầu
    end_time        TIME            NOT NULL,           -- Giờ kết thúc
    topic           VARCHAR(300),                       -- Nội dung buổi học
    status          ENUM('scheduled','done','cancelled') DEFAULT 'scheduled',
    note            TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

-- =============================================
-- 17. BẢNG ĐIỂM DANH (attendance)
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    session_id      INT             NOT NULL,
    student_id      INT             NOT NULL,
    status          ENUM('present','absent','late','excused') DEFAULT 'present',
    note            TEXT,                               -- VD: "Xin phép nghỉ vì bệnh"
    UNIQUE KEY uq_session_student (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES class_sessions(session_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_classes_course   ON classes(course_id);
CREATE INDEX idx_classes_teacher  ON classes(teacher_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class   ON enrollments(class_id);
CREATE INDEX idx_attendance_session  ON attendance(session_id);
CREATE INDEX idx_tuition_enrollment  ON tuition_payments(enrollment_id);
CREATE INDEX idx_sessions_class      ON class_sessions(class_id);

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

-- Giáo viên mẫu
INSERT INTO teachers (full_name, email, phone, specialty, degree, experience_years, bio, salary, salary_type, join_date) VALUES
('Nguyễn Thị Lan',    'lan.piano@musicstore.com',  '0901111111', 'Piano',  'Cử nhân Âm nhạc - Nhạc viện TP.HCM',  8, 'Giáo viên piano với 8 năm kinh nghiệm giảng dạy từ thiếu nhi đến người lớn.', 200000, 'per_session', '2020-01-15'),
('Trần Văn Minh',     'minh.guitar@musicstore.com','0902222222', 'Guitar', 'Thạc sĩ Guitar - Đại học Văn hóa TP.HCM', 10, 'Chuyên guitar acoustic, classic và electric. Từng biểu diễn tại nhiều sân khấu lớn.', 220000, 'per_session', '2019-06-01'),
('Lê Thị Thu Hương',  'huong.violin@musicstore.com','0903333333','Violin', 'Cử nhân Violin - Nhạc viện Hà Nội', 6, 'Giáo viên violin trẻ, nhiệt tình, phương pháp dạy sinh động và hiệu quả.', 200000, 'per_session', '2021-03-10'),
('Phạm Quốc Bảo',    'bao.organ@musicstore.com',  '0904444444', 'Organ',  'Cao đẳng Âm nhạc - Trường CĐ Văn hóa Nghệ thuật', 5, 'Chuyên dạy organ điện tử, phối khí và sáng tác cho mọi lứa tuổi.', 180000, 'per_session', '2022-01-20');

-- Khóa học mẫu
INSERT INTO courses (course_name, category_id, level, description, duration_months, sessions_total, tuition_fee) VALUES
('Piano Cơ bản',        1, 'beginner',     'Khóa học piano dành cho người mới bắt đầu, học đọc nhạc và kỹ thuật cơ bản.',          3, 36, 3600000),
('Piano Nâng cao',      1, 'intermediate', 'Khóa học nâng cao kỹ thuật chơi piano, luyện các bài cổ điển và hiện đại.',             3, 36, 4200000),
('Guitar Acoustic CĐ',  3, 'beginner',     'Học guitar acoustic từ đầu: hợp âm, strumming, fingerpicking.',                         3, 36, 3000000),
('Guitar Electric NC',  3, 'intermediate', 'Kỹ thuật guitar điện: lead, rhythm, hiệu ứng và phong cách rock/blues.',                 3, 36, 3600000),
('Violin CĐ',           4, 'beginner',     'Học violin từ cơ bản: cách cầm đàn, đặt cung, tư thế đúng và các bài đầu tiên.',        4, 48, 4800000),
('Organ Điện tử CĐ',   2, 'beginner',     'Học organ điện tử: đọc nhạc, đệm nhạc với các kiểu nhịp điệu tự động.',                 3, 36, 3000000);

-- Lớp học mẫu
INSERT INTO classes (class_name, course_id, teacher_id, max_students, room, schedule_days, schedule_time, start_date, end_date, status) VALUES
('Piano CĐ - T2,T4 Sáng',    1, 1, 8,  'Phòng 101', 'Thứ 2, Thứ 4', '08:00 - 09:30', '2025-06-02', '2025-08-30', 'upcoming'),
('Piano CĐ - T3,T5 Chiều',   1, 1, 8,  'Phòng 101', 'Thứ 3, Thứ 5', '14:00 - 15:30', '2025-06-03', '2025-08-30', 'upcoming'),
('Piano NC - T7 Sáng',        2, 1, 6,  'Phòng 101', 'Thứ 7',         '09:00 - 11:00', '2025-06-07', '2025-08-30', 'upcoming'),
('Guitar CĐ - T2,T5 Tối',    3, 2, 10, 'Phòng 102', 'Thứ 2, Thứ 5', '18:00 - 19:30', '2025-06-02', '2025-08-30', 'upcoming'),
('Guitar Electric - T7,CN',   4, 2, 8,  'Phòng 102', 'Thứ 7, CN',     '10:00 - 11:30', '2025-06-07', '2025-08-30', 'upcoming'),
('Violin CĐ - T3,T6 Sáng',   5, 3, 6,  'Phòng 103', 'Thứ 3, Thứ 6', '08:00 - 09:30', '2025-06-03', '2025-08-30', 'upcoming'),
('Organ CĐ - T4,T6 Chiều',   6, 4, 10, 'Phòng 104', 'Thứ 4, Thứ 6', '15:00 - 16:30', '2025-06-04', '2025-08-30', 'upcoming');

-- Học viên mẫu
INSERT INTO students (full_name, email, phone, date_of_birth, gender, address, parent_name, parent_phone) VALUES
('Nguyễn Bảo An',    'baoan@gmail.com',  '0911001001', '2015-03-12', 'male',   '12 Lê Lợi, Q.1, TP.HCM',          'Nguyễn Thành Nam',  '0911000001'),
('Trần Ngọc Mai',    'ngocmai@gmail.com','0911001002', '2014-07-25', 'female', '45 Nguyễn Trãi, Q.5, TP.HCM',     'Trần Văn Sơn',      '0911000002'),
('Lê Minh Khoa',     'minhkhoa@gmail.com','0911001003','2010-11-08', 'male',   '88 Cách Mạng Tháng 8, Q.3',       'Lê Thị Hoa',        '0911000003'),
('Phạm Thùy Linh',   NULL,               '0911001004', '2000-05-20', 'female', '23 Võ Văn Tần, Q.3, TP.HCM',     NULL,                 NULL),
('Hoàng Đức Thịnh',  NULL,               '0911001005', '1998-09-15', 'male',   '67 Đinh Tiên Hoàng, Bình Thạnh',  NULL,                 NULL),
('Vũ Thị Kim Anh',   'kimanh@gmail.com', '0911001006', '2012-01-30', 'female', '10 Phan Xích Long, Phú Nhuận',    'Vũ Đình Long',       '0911000006'),
('Đặng Quang Huy',   NULL,               '0911001007', '2005-06-18', 'male',   '34 Bùi Thị Xuân, Q.1, TP.HCM',   'Đặng Thị Thu',       '0911000007');

-- Đăng ký học mẫu
INSERT INTO enrollments (student_id, class_id, enroll_date, status, tuition_total, discount_amount, final_amount) VALUES
(1, 1, '2025-05-20', 'active', 3600000, 0,      3600000),  -- Bảo An học Piano CĐ sáng
(2, 1, '2025-05-21', 'active', 3600000, 360000, 3240000),  -- Ngọc Mai học Piano CĐ sáng (giảm 10%)
(3, 4, '2025-05-22', 'active', 3000000, 0,      3000000),  -- Minh Khoa học Guitar CĐ tối
(4, 2, '2025-05-22', 'active', 3600000, 0,      3600000),  -- Thùy Linh học Piano CĐ chiều
(5, 4, '2025-05-23', 'active', 3000000, 300000, 2700000),  -- Đức Thịnh học Guitar CĐ (giảm)
(6, 6, '2025-05-24', 'active', 4800000, 0,      4800000),  -- Kim Anh học Violin CĐ
(7, 7, '2025-05-25', 'active', 3000000, 0,      3000000);  -- Quang Huy học Organ CĐ

-- Học phí đã đóng mẫu
INSERT INTO tuition_payments (enrollment_id, amount, payment_date, payment_method, note) VALUES
(1, 3600000, '2025-05-20', 'cash',    'Đóng đủ 1 lần'),
(2, 3240000, '2025-05-21', 'banking', 'Chuyển khoản, đã giảm 10% học sinh'),
(3, 1500000, '2025-05-22', 'cash',    'Đóng đợt 1'),
(4, 3600000, '2025-05-22', 'momo',    'Thanh toán qua MoMo'),
(6, 2400000, '2025-05-24', 'cash',    'Đóng đợt 1/2');