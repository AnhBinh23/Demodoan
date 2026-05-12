-- =============================================
-- CHẠY FILE NÀY ĐỂ TẠO/CẬP NHẬT TOÀN BỘ BẢNG
-- Chạy trong database: music_store
-- =============================================
USE music_store;

-- =============================================
-- 1. CẬP NHẬT ROLE (bọc trong IF để không lỗi khi chạy lại)
-- =============================================
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'music_store'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role'
    AND COLUMN_TYPE LIKE '%super_admin%'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE users MODIFY COLUMN role ENUM('customer','staff','admin','super_admin') DEFAULT 'customer'",
    "SELECT 'role column already updated' AS info"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 2. BẢNG PHÂN QUYỀN
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
-- 3. BẢNG NHẠC CỤ
-- =============================================
CREATE TABLE IF NOT EXISTS instruments (
    instrument_id   INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    icon            VARCHAR(10),
    description     TEXT,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. BẢNG GIÁO VIÊN
-- =============================================
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(150)   NOT NULL,
    email            VARCHAR(150)   NOT NULL UNIQUE,
    phone            VARCHAR(15),
    avatar           VARCHAR(500),
    specialty        VARCHAR(200)   NOT NULL,
    degree           VARCHAR(200),
    experience_years INT            DEFAULT 0,
    bio              TEXT,
    salary           DECIMAL(15,0)  DEFAULT 0,
    salary_type      ENUM('per_session','monthly') DEFAULT 'per_session',
    join_date        DATE,
    is_active        TINYINT(1)     DEFAULT 1,
    created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 5. BẢNG KHÓA HỌC
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_name     VARCHAR(200)   NOT NULL,
    category_id     INT,
    level           ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description     TEXT,
    duration_months INT            DEFAULT 3,
    sessions_total  INT            DEFAULT 0,
    tuition_fee     DECIMAL(15,0)  NOT NULL,
    image_url       VARCHAR(500),
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- =============================================
-- 6. BẢNG LỚP HỌC
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
    class_id        INT AUTO_INCREMENT PRIMARY KEY,
    class_name      VARCHAR(200)   NOT NULL,
    course_id       INT,
    teacher_id      INT,
    schedule_days   VARCHAR(100),
    schedule_time   VARCHAR(50),
    room            VARCHAR(50),
    max_students    INT            DEFAULT 10,
    start_date      DATE,
    end_date        DATE,
    status          ENUM('upcoming','ongoing','finished') DEFAULT 'upcoming',
    notes           TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id)   REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id)  REFERENCES teachers(teacher_id)
);

-- =============================================
-- 7. BẢNG HỌC VIÊN
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)   NOT NULL,
    birth_date      DATE,
    gender          ENUM('male','female','other'),
    phone           VARCHAR(15),
    email           VARCHAR(150),
    address         TEXT,
    parent_name     VARCHAR(150),
    parent_phone    VARCHAR(15),
    avatar          VARCHAR(500),
    notes           TEXT,
    status          ENUM('active','inactive','graduated') DEFAULT 'active',
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 8. BẢNG ĐĂNG KÝ HỌC (enrollments)
-- =============================================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT            NOT NULL,
    class_id        INT            NOT NULL,
    enrolled_at     DATETIME       DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('active','dropped','completed') DEFAULT 'active',
    UNIQUE KEY uq_student_class (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id)   REFERENCES classes(class_id)
);

-- =============================================
-- 9. BẢNG CA LÀM VIỆC
-- =============================================
CREATE TABLE IF NOT EXISTS work_slots (
    slot_id         INT AUTO_INCREMENT PRIMARY KEY,
    label           VARCHAR(100)   NOT NULL,
    start_time      TIME           NOT NULL,
    end_time        TIME           NOT NULL,
    is_active       TINYINT(1)     DEFAULT 1
);

-- Thêm ca mẫu nếu chưa có
INSERT IGNORE INTO work_slots (slot_id, label, start_time, end_time) VALUES
(1, 'Ca sáng (7:00 - 9:00)',   '07:00:00', '09:00:00'),
(2, 'Ca sáng (9:00 - 11:00)',  '09:00:00', '11:00:00'),
(3, 'Ca chiều (13:00 - 15:00)','13:00:00', '15:00:00'),
(4, 'Ca chiều (15:00 - 17:00)','15:00:00', '17:00:00'),
(5, 'Ca tối (17:30 - 19:30)',  '17:30:00', '19:30:00'),
(6, 'Ca tối (19:30 - 21:30)',  '19:30:00', '21:30:00');

-- =============================================
-- 10. BẢNG CHẤM CÔNG GIÁO VIÊN
-- =============================================
CREATE TABLE IF NOT EXISTS teacher_timekeeping (
    record_id       INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      INT            NOT NULL,
    slot_id         INT,
    class_id        INT,
    work_date       DATE           NOT NULL,
    status          ENUM('present','absent','late','leave') DEFAULT 'present',
    note            TEXT,
    created_by      INT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (slot_id)    REFERENCES work_slots(slot_id),
    FOREIGN KEY (class_id)   REFERENCES classes(class_id)
);

-- =============================================
-- 11. BẢNG HỌC PHÍ
-- =============================================
CREATE TABLE IF NOT EXISTS tuition_payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT            NOT NULL,
    class_id        INT            NOT NULL,
    amount          DECIMAL(15,0)  NOT NULL,
    paid_at         DATETIME,
    due_date        DATE,
    status          ENUM('pending','paid','overdue') DEFAULT 'pending',
    note            TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id)   REFERENCES classes(class_id)
);

-- =============================================
-- 12. BẢNG BUỔI HỌC (class_sessions)
-- =============================================
CREATE TABLE IF NOT EXISTS class_sessions (
    session_id      INT AUTO_INCREMENT PRIMARY KEY,
    class_id        INT            NOT NULL,
    session_date    DATE           NOT NULL,
    slot_id         INT,
    topic           VARCHAR(300),
    notes           TEXT,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (slot_id)  REFERENCES work_slots(slot_id)
);

-- =============================================
-- 13. BẢNG ĐIỂM DANH HỌC VIÊN (attendance)
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    session_id      INT            NOT NULL,
    student_id      INT            NOT NULL,
    status          ENUM('present','absent','late','leave') DEFAULT 'present',
    note            TEXT,
    UNIQUE KEY uq_session_student (session_id, student_id),
    FOREIGN KEY (session_id)  REFERENCES class_sessions(session_id),
    FOREIGN KEY (student_id)  REFERENCES students(student_id)
);

-- =============================================
-- 14. BẢNG TIN TỨC (news_posts)
-- =============================================
CREATE TABLE IF NOT EXISTS news_posts (
    post_id         INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(300)   NOT NULL,
    slug            VARCHAR(350)   NOT NULL UNIQUE,
    excerpt         TEXT,
    content         LONGTEXT       NOT NULL,
    thumbnail       VARCHAR(500),
    tag             VARCHAR(100),
    is_featured     TINYINT(1)     DEFAULT 0,
    is_published    TINYINT(1)     DEFAULT 1,
    views           INT            DEFAULT 0,
    author_id       INT,
    published_at    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =============================================
-- 15. BẢNG BẢN NHẠC (sheet_music)
-- =============================================
CREATE TABLE IF NOT EXISTS sheet_music (
    sheet_id        INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200)   NOT NULL,
    composer        VARCHAR(150),
    instrument      VARCHAR(100),
    difficulty      ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description     TEXT,
    file_url        VARCHAR(500)   NOT NULL,
    file_type       VARCHAR(10)    DEFAULT 'pdf',
    thumbnail_url   VARCHAR(500),
    is_free         TINYINT(1)     DEFAULT 1,
    view_count      INT            DEFAULT 0,
    is_active       TINYINT(1)     DEFAULT 1,
    created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOÀN TẤT
-- =============================================
SELECT 'Tạo bảng thành công!' AS result;