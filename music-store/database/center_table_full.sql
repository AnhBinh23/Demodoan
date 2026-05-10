-- =============================================
-- TOÀN BỘ BẢNG MỚI CHO TRUNG TÂM ÂM NHẠC
-- Chạy file này trong database: music_store
-- =============================================
USE music_store;

-- Thêm role mới cho bảng users
ALTER TABLE users MODIFY COLUMN role 
  ENUM('customer','staff','admin','super_admin') DEFAULT 'customer';

-- =============================================
-- BẢNG PHÂN QUYỀN CHI TIẾT
-- =============================================
CREATE TABLE IF NOT EXISTS admin_permissions (
    permission_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT NOT NULL UNIQUE,
    can_manage_products  TINYINT(1) DEFAULT 0,
    can_manage_orders    TINYINT(1) DEFAULT 0,
    can_manage_users     TINYINT(1) DEFAULT 0,
    can_manage_teachers  TINYINT(1) DEFAULT 0,
    can_manage_students  TINYINT(1) DEFAULT 0,
    can_manage_classes   TINYINT(1) DEFAULT 0,
    can_manage_finance   TINYINT(1) DEFAULT 0,
    can_view_reports     TINYINT(1) DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- NHẠC CỤ (instrument)
-- =============================================
CREATE TABLE IF NOT EXISTS instruments (
    instrument_id   INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,   -- Piano, Guitar, Violin, Thanh nhạc
    icon            VARCHAR(20),             -- emoji
    is_active       TINYINT(1)  DEFAULT 1
);

INSERT IGNORE INTO instruments (instrument_id, name, icon) VALUES
(1, 'Piano',      '🎹'),
(2, 'Guitar',     '🎸'),
(3, 'Violin',     '🎻'),
(4, 'Thanh nhạc', '🎤'),
(5, 'Organ',      '🎹'),
(6, 'Trống',      '🥁');

-- =============================================
-- LOẠI KHÓA HỌC (course_types)
-- =============================================
CREATE TABLE IF NOT EXISTS course_types (
    type_id         INT AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(150) NOT NULL,   -- "Cá nhân 1vs1 - 16 buổi"
    type_code       VARCHAR(50),             -- "1v1_16", "1v1_24", "group_24"
    description     TEXT,
    total_sessions  INT DEFAULT 0,           -- tổng số buổi
    students_per_class INT DEFAULT 1,        -- 1 = cá nhân, 3 = nhóm 3
    is_active       TINYINT(1) DEFAULT 1
);

INSERT IGNORE INTO course_types (type_id, type_name, type_code, description, total_sessions, students_per_class) VALUES
(1, 'Cá nhân 1vs1 — 16 buổi',  '1v1_16',    'Học cá nhân 1 thầy 1 trò, 16 buổi học', 16, 1),
(2, 'Cá nhân 1vs1 — 24 buổi',  '1v1_24',    'Học cá nhân 1 thầy 1 trò, 24 buổi học', 24, 1),
(3, 'Nhóm 3vs3 — 24 buổi',     'group_24',  'Học nhóm tối đa 3 học viên, 24 buổi',   24, 3),
(4, 'Thanh nhạc — 16 buổi',    'vocal_16',  'Khóa thanh nhạc cá nhân, 16 buổi',      16, 1),
(5, 'Thanh nhạc — 24 buổi',    'vocal_24',  'Khóa thanh nhạc cá nhân, 24 buổi',      24, 1);

-- =============================================
-- KHÓA HỌC (courses) — kết hợp nhạc cụ + loại khóa
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_name     VARCHAR(200)   NOT NULL,
    instrument_id   INT,
    type_id         INT,
    level           ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description     TEXT,
    tuition_fee     DECIMAL(15,0)  NOT NULL DEFAULT 0,
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (type_id)       REFERENCES course_types(type_id)
);

-- Dữ liệu mẫu khóa học
INSERT IGNORE INTO courses (course_id, course_name, instrument_id, type_id, level, tuition_fee) VALUES
(1,  'Piano — Cá nhân 1vs1 (16 buổi)',  1, 1, 'beginner',      2400000),
(2,  'Piano — Cá nhân 1vs1 (24 buổi)',  1, 2, 'beginner',      3600000),
(3,  'Piano — Nhóm 3vs3 (24 buổi)',     1, 3, 'beginner',      2400000),
(4,  'Guitar — Cá nhân 1vs1 (16 buổi)', 2, 1, 'beginner',     2000000),
(5,  'Guitar — Cá nhân 1vs1 (24 buổi)', 2, 2, 'beginner',     3000000),
(6,  'Guitar — Nhóm 3vs3 (24 buổi)',    2, 3, 'beginner',      2000000),
(7,  'Violin — Cá nhân 1vs1 (16 buổi)', 3, 1, 'beginner',     2800000),
(8,  'Violin — Cá nhân 1vs1 (24 buổi)', 3, 2, 'beginner',     4200000),
(9,  'Thanh nhạc — 16 buổi',           4, 4, 'beginner',       2400000),
(10, 'Thanh nhạc — 24 buổi',           4, 5, 'beginner',       3600000);

-- =============================================
-- GIÁO VIÊN (teachers)
-- =============================================
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(150)   NOT NULL,
    email            VARCHAR(150)   UNIQUE,
    phone            VARCHAR(15),
    avatar           VARCHAR(500),
    instrument_id    INT,                        -- nhạc cụ chính
    specialty        VARCHAR(200),               -- mô tả chuyên môn
    degree           VARCHAR(200),
    experience_years INT            DEFAULT 0,
    bio              TEXT,
    salary           DECIMAL(15,0)  DEFAULT 0,
    salary_type      ENUM('per_session','monthly') DEFAULT 'per_session',
    join_date        DATE,
    is_active        TINYINT(1)     DEFAULT 1,
    created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

-- =============================================
-- CA LÀM VIỆC THEO GIỜ (work_slots) — 7:00 → 21:00
-- =============================================
CREATE TABLE IF NOT EXISTS work_slots (
    slot_id     INT AUTO_INCREMENT PRIMARY KEY,
    slot_label  VARCHAR(20) NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    slot_order  INT         DEFAULT 0,
    is_active   TINYINT(1)  DEFAULT 1
);

INSERT IGNORE INTO work_slots (slot_id, slot_label, start_time, end_time, slot_order) VALUES
(1,  '07:00 - 08:00', '07:00:00', '08:00:00',  1),
(2,  '08:00 - 09:00', '08:00:00', '09:00:00',  2),
(3,  '09:00 - 10:00', '09:00:00', '10:00:00',  3),
(4,  '10:00 - 11:00', '10:00:00', '11:00:00',  4),
(5,  '11:00 - 12:00', '11:00:00', '12:00:00',  5),
(6,  '12:00 - 13:00', '12:00:00', '13:00:00',  6),
(7,  '13:00 - 14:00', '13:00:00', '14:00:00',  7),
(8,  '14:00 - 15:00', '14:00:00', '15:00:00',  8),
(9,  '15:00 - 16:00', '15:00:00', '16:00:00',  9),
(10, '16:00 - 17:00', '16:00:00', '17:00:00', 10),
(11, '17:00 - 18:00', '17:00:00', '18:00:00', 11),
(12, '18:00 - 19:00', '18:00:00', '19:00:00', 12),
(13, '19:00 - 20:00', '19:00:00', '20:00:00', 13),
(14, '20:00 - 21:00', '20:00:00', '21:00:00', 14);

-- =============================================
-- CHẤM CÔNG GIÁO VIÊN (teacher_timekeeping)
-- =============================================
CREATE TABLE IF NOT EXISTS teacher_timekeeping (
    record_id       INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      INT  NOT NULL,
    work_date       DATE NOT NULL,
    slot_id         INT  NOT NULL,
    status          ENUM('present','absent','late','leave') DEFAULT 'present',
    -- present=Có mặt, absent=Vắng, late=Đi trễ, leave=Nghỉ phép
    note            TEXT,
    created_by      INT,                        -- user_id admin chấm
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_teacher_date_slot (teacher_id, work_date, slot_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id)    REFERENCES work_slots(slot_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =============================================
-- LỚP HỌC (classes)
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
    class_id        INT AUTO_INCREMENT PRIMARY KEY,
    class_name      VARCHAR(150)   NOT NULL,
    course_id       INT            NOT NULL,
    teacher_id      INT            NOT NULL,
    instrument_id   INT,                        -- nhạc cụ của lớp (piano/guitar...)
    max_students    INT            DEFAULT 3,
    room            VARCHAR(50),
    schedule_days   VARCHAR(100),
    schedule_time   VARCHAR(50),
    start_date      DATE           NOT NULL,
    end_date        DATE,
    status          ENUM('upcoming','ongoing','finished','cancelled') DEFAULT 'upcoming',
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id)     REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id)    REFERENCES teachers(teacher_id),
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

-- =============================================
-- HỌC VIÊN (students)
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)   NOT NULL,
    email           VARCHAR(150)   UNIQUE,
    phone           VARCHAR(15),
    date_of_birth   DATE,
    gender          ENUM('male','female','other'),
    address         VARCHAR(300),
    avatar          VARCHAR(500),
    parent_name     VARCHAR(150),
    parent_phone    VARCHAR(15),
    note            TEXT,
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- ĐĂNG KÝ HỌC (enrollments)
-- =============================================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT            NOT NULL,
    class_id        INT            NOT NULL,
    enroll_date     DATE           DEFAULT (CURRENT_DATE),
    status          ENUM('active','paused','completed','dropped') DEFAULT 'active',
    tuition_total   DECIMAL(15,0)  NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,0)  DEFAULT 0,
    final_amount    DECIMAL(15,0)  NOT NULL DEFAULT 0,
    note            TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_class (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id)   REFERENCES classes(class_id)
);

-- =============================================
-- HỌC PHÍ (tuition_payments)
-- =============================================
CREATE TABLE IF NOT EXISTS tuition_payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id   INT            NOT NULL,
    amount          DECIMAL(15,0)  NOT NULL,
    payment_date    DATE           DEFAULT (CURRENT_DATE),
    payment_method  ENUM('cash','banking','momo','vnpay') DEFAULT 'cash',
    note            TEXT,
    created_by      INT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id),
    FOREIGN KEY (created_by)    REFERENCES users(user_id)
);

-- =============================================
-- BUỔI HỌC (class_sessions)
-- =============================================
CREATE TABLE IF NOT EXISTS class_sessions (
    session_id      INT AUTO_INCREMENT PRIMARY KEY,
    class_id        INT            NOT NULL,
    session_date    DATE           NOT NULL,
    start_time      TIME           NOT NULL,
    end_time        TIME           NOT NULL,
    topic           VARCHAR(300),
    status          ENUM('scheduled','done','cancelled') DEFAULT 'scheduled',
    note            TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

-- =============================================
-- ĐIỂM DANH HỌC VIÊN (attendance)
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    session_id      INT            NOT NULL,
    student_id      INT            NOT NULL,
    status          ENUM('present','absent','late','excused') DEFAULT 'present',
    note            TEXT,
    UNIQUE KEY uq_session_student (session_id, student_id),
    FOREIGN KEY (session_id)  REFERENCES class_sessions(session_id),
    FOREIGN KEY (student_id)  REFERENCES students(student_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_timekeeping_teacher ON teacher_timekeeping(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timekeeping_date    ON teacher_timekeeping(work_date);
CREATE INDEX IF NOT EXISTS idx_classes_teacher     ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class   ON enrollments(class_id);