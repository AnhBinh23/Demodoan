-- =============================================
-- CHẠY FILE NÀY 1 LẦN DUY NHẤT
-- Tạo toàn bộ bảng mới cho trung tâm + tin tức
-- =============================================
USE music_store;

-- Thêm role mới
ALTER TABLE users MODIFY COLUMN role 
  ENUM('customer','staff','admin','super_admin') DEFAULT 'customer';

-- PHÂN QUYỀN
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

-- NHẠC CỤ
CREATE TABLE IF NOT EXISTS instruments (
    instrument_id   INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    icon            VARCHAR(20),
    is_active       TINYINT(1) DEFAULT 1
);
INSERT IGNORE INTO instruments (instrument_id, name, icon) VALUES
(1,'Piano','🎹'),(2,'Guitar','🎸'),(3,'Violin','🎻'),
(4,'Thanh nhạc','🎤'),(5,'Organ','🎹'),(6,'Trống','🥁');

-- LOẠI KHÓA HỌC
CREATE TABLE IF NOT EXISTS course_types (
    type_id         INT AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(150) NOT NULL,
    type_code       VARCHAR(50),
    description     TEXT,
    total_sessions  INT DEFAULT 0,
    students_per_class INT DEFAULT 1,
    is_active       TINYINT(1) DEFAULT 1
);
INSERT IGNORE INTO course_types (type_id,type_name,type_code,total_sessions,students_per_class) VALUES
(1,'Cá nhân 1vs1 — 16 buổi','1v1_16',16,1),
(2,'Cá nhân 1vs1 — 24 buổi','1v1_24',24,1),
(3,'Nhóm 3vs3 — 24 buổi','group_24',24,3),
(4,'Thanh nhạc — 16 buổi','vocal_16',16,1),
(5,'Thanh nhạc — 24 buổi','vocal_24',24,1);

-- KHÓA HỌC
CREATE TABLE IF NOT EXISTS courses (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_name     VARCHAR(200) NOT NULL,
    instrument_id   INT,
    type_id         INT,
    level           ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description     TEXT,
    tuition_fee     DECIMAL(15,0) NOT NULL DEFAULT 0,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id),
    FOREIGN KEY (type_id) REFERENCES course_types(type_id)
);
INSERT IGNORE INTO courses (course_id,course_name,instrument_id,type_id,tuition_fee) VALUES
(1,'Piano — Cá nhân 1vs1 (16 buổi)',1,1,2400000),
(2,'Piano — Cá nhân 1vs1 (24 buổi)',1,2,3600000),
(3,'Piano — Nhóm 3vs3 (24 buổi)',1,3,2400000),
(4,'Guitar — Cá nhân 1vs1 (16 buổi)',2,1,2000000),
(5,'Guitar — Cá nhân 1vs1 (24 buổi)',2,2,3000000),
(6,'Guitar — Nhóm 3vs3 (24 buổi)',2,3,2000000),
(7,'Violin — Cá nhân 1vs1 (16 buổi)',3,1,2800000),
(8,'Violin — Cá nhân 1vs1 (24 buổi)',3,2,4200000),
(9,'Thanh nhạc — 16 buổi',4,4,2400000),
(10,'Thanh nhạc — 24 buổi',4,5,3600000);

-- GIÁO VIÊN
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(150) NOT NULL,
    email            VARCHAR(150) UNIQUE,
    phone            VARCHAR(15),
    avatar           VARCHAR(500),
    instrument_id    INT,
    specialty        VARCHAR(200),
    degree           VARCHAR(200),
    experience_years INT DEFAULT 0,
    bio              TEXT,
    salary           DECIMAL(15,0) DEFAULT 0,
    salary_type      ENUM('per_session','monthly') DEFAULT 'per_session',
    join_date        DATE,
    is_active        TINYINT(1) DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

-- CA LÀM VIỆC 7:00 → 21:00
CREATE TABLE IF NOT EXISTS work_slots (
    slot_id     INT AUTO_INCREMENT PRIMARY KEY,
    slot_label  VARCHAR(20) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    slot_order  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1
);
INSERT IGNORE INTO work_slots (slot_id,slot_label,start_time,end_time,slot_order) VALUES
(1,'07:00-08:00','07:00:00','08:00:00',1),(2,'08:00-09:00','08:00:00','09:00:00',2),
(3,'09:00-10:00','09:00:00','10:00:00',3),(4,'10:00-11:00','10:00:00','11:00:00',4),
(5,'11:00-12:00','11:00:00','12:00:00',5),(6,'12:00-13:00','12:00:00','13:00:00',6),
(7,'13:00-14:00','13:00:00','14:00:00',7),(8,'14:00-15:00','14:00:00','15:00:00',8),
(9,'15:00-16:00','15:00:00','16:00:00',9),(10,'16:00-17:00','16:00:00','17:00:00',10),
(11,'17:00-18:00','17:00:00','18:00:00',11),(12,'18:00-19:00','18:00:00','19:00:00',12),
(13,'19:00-20:00','19:00:00','20:00:00',13),(14,'20:00-21:00','20:00:00','21:00:00',14);

-- CHẤM CÔNG GIÁO VIÊN
CREATE TABLE IF NOT EXISTS teacher_timekeeping (
    record_id   INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id  INT NOT NULL,
    work_date   DATE NOT NULL,
    slot_id     INT NOT NULL,
    status      ENUM('present','absent','late','leave') DEFAULT 'present',
    note        TEXT,
    created_by  INT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_teacher_date_slot (teacher_id,work_date,slot_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES work_slots(slot_id)
);

-- LỚP HỌC
CREATE TABLE IF NOT EXISTS classes (
    class_id        INT AUTO_INCREMENT PRIMARY KEY,
    class_name      VARCHAR(150) NOT NULL,
    course_id       INT NOT NULL,
    teacher_id      INT NOT NULL,
    instrument_id   INT,
    max_students    INT DEFAULT 3,
    room            VARCHAR(50),
    schedule_days   VARCHAR(100),
    schedule_time   VARCHAR(50),
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          ENUM('upcoming','ongoing','finished','cancelled') DEFAULT 'upcoming',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id)
);

-- HỌC VIÊN
CREATE TABLE IF NOT EXISTS students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    phone           VARCHAR(15),
    date_of_birth   DATE,
    gender          ENUM('male','female','other'),
    address         VARCHAR(300),
    avatar          VARCHAR(500),
    parent_name     VARCHAR(150),
    parent_phone    VARCHAR(15),
    note            TEXT,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ĐĂNG KÝ HỌC
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    class_id        INT NOT NULL,
    enroll_date     DATE DEFAULT (CURRENT_DATE),
    status          ENUM('active','paused','completed','dropped') DEFAULT 'active',
    tuition_total   DECIMAL(15,0) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,0) DEFAULT 0,
    final_amount    DECIMAL(15,0) NOT NULL DEFAULT 0,
    note            TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_class (student_id,class_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

-- HỌC PHÍ
CREATE TABLE IF NOT EXISTS tuition_payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id   INT NOT NULL,
    amount          DECIMAL(15,0) NOT NULL,
    payment_date    DATE DEFAULT (CURRENT_DATE),
    payment_method  ENUM('cash','banking','momo','vnpay') DEFAULT 'cash',
    note            TEXT,
    created_by      INT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);

-- BUỔI HỌC
CREATE TABLE IF NOT EXISTS class_sessions (
    session_id      INT AUTO_INCREMENT PRIMARY KEY,
    class_id        INT NOT NULL,
    session_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    topic           VARCHAR(300),
    status          ENUM('scheduled','done','cancelled') DEFAULT 'scheduled',
    note            TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

-- ĐIỂM DANH HỌC VIÊN
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    session_id      INT NOT NULL,
    student_id      INT NOT NULL,
    status          ENUM('present','absent','late','excused') DEFAULT 'present',
    note            TEXT,
    UNIQUE KEY uq_session_student (session_id,student_id),
    FOREIGN KEY (session_id) REFERENCES class_sessions(session_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- TIN TỨC
CREATE TABLE IF NOT EXISTS news_posts (
    post_id         INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(300) NOT NULL,
    slug            VARCHAR(300) NOT NULL UNIQUE,
    excerpt         TEXT,
    content         LONGTEXT NOT NULL,
    thumbnail       VARCHAR(500),
    tag             VARCHAR(100),
    is_featured     TINYINT(1) DEFAULT 0,
    is_published    TINYINT(1) DEFAULT 1,
    views           INT DEFAULT 0,
    author_id       INT,
    published_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Bài viết mẫu
INSERT IGNORE INTO news_posts (title,slug,excerpt,content,tag,is_featured,is_published) VALUES
('Top 5 đàn Piano điện tử tốt nhất cho người mới học','top-5-dan-piano-dien-tu-2024',
 'Bạn đang tìm kiếm cây đàn piano điện tử đầu tiên? Cùng khám phá 5 mẫu đàn được yêu thích nhất.',
 '<h2>Tại sao nên chọn piano điện tử?</h2><p>Piano điện tử là lựa chọn lý tưởng cho người mới bắt đầu vì giá thành hợp lý, không cần chỉnh dây, có thể luyện tập với tai nghe.</p><h2>Top 5 đàn được khuyến nghị</h2><h3>1. Yamaha P-45</h3><p>88 phím nặng chuẩn, âm thanh AWM Stereo Sampling, giá khoảng 8-9 triệu đồng.</p><h3>2. Casio CDP-S100</h3><p>Thiết kế siêu mỏng, trọng lượng 9.7kg, giá khoảng 7 triệu đồng.</p><h3>3. Roland FP-30X</h3><p>Âm thanh SuperNATURAL Piano, phím PHA-4 Standard, giá khoảng 16 triệu đồng.</p><h3>4. Korg B2</h3><p>88 phím nặng, loa 15W, giá khoảng 9 triệu đồng.</p><h3>5. Kawai ES120</h3><p>Phím RHC cho cảm giác đàn cơ thật, giá khoảng 13 triệu đồng.</p>',
 'Piano',1,1),
('Hướng dẫn chọn đàn Guitar cho người mới bắt đầu','huong-dan-chon-guitar-nguoi-moi',
 'Guitar acoustic, classic hay electric? Bài viết giúp bạn chọn cây đàn phù hợp nhất.',
 '<h2>Các loại Guitar phổ biến</h2><h3>Guitar Classic</h3><p>Dây nylon, âm thanh ấm dịu, phù hợp nhạc cổ điển. Tốt cho người mới vì dây mềm.</p><h3>Guitar Acoustic</h3><p>Dây thép, âm thanh trong sáng, phổ biến trong nhạc pop, folk.</p><h3>Guitar điện</h3><p>Cần amplifier, phù hợp rock, blues. Nên học acoustic trước.</p>',
 'Guitar',0,1),
('Lợi ích bất ngờ khi cho trẻ em học nhạc từ sớm','loi-ich-cho-tre-hoc-nhac-tu-som',
 'Nghiên cứu khoa học chứng minh âm nhạc giúp trẻ phát triển trí não và kỹ năng vượt trội.',
 '<h2>Âm nhạc và sự phát triển của trẻ</h2><p>Trẻ học nhạc từ nhỏ có khả năng ngôn ngữ và toán học tốt hơn đáng kể.</p><h2>6 lợi ích chính</h2><h3>1. Phát triển trí não toàn diện</h3><p>Chơi nhạc cụ kích hoạt cả hai bán cầu não.</p><h3>2. Rèn luyện kỷ luật</h3><p>Luyện tập hàng ngày giúp trẻ hình thành thói quen tốt.</p><h3>3. Tăng sự tự tin</h3><p>Biểu diễn trước đám đông vượt qua nỗi sợ hãi.</p>',
 'Kiến thức',0,1);

-- INDEX
CREATE INDEX idx_news_slug          ON news_posts(slug);
CREATE INDEX idx_news_published     ON news_posts(is_published, published_at);
CREATE INDEX idx_timekeeping_teacher ON teacher_timekeeping(teacher_id, work_date);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class   ON enrollments(class_id);
CREATE INDEX idx_classes_teacher     ON classes(teacher_id);
CREATE INDEX idx_sessions_class      ON class_sessions(class_id)
SELECT 'OK - Tất cả bảng đã tạo thành công!' AS result;