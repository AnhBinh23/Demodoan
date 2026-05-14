-- =============================================
-- DATABASE: MUSIC STORE - CỬA HÀNG NHẠC CỤ
-- Công nghệ: MySQL
-- =============================================

CREATE DATABASE IF NOT EXISTS music_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE music_store;

-- =============================================
-- 1. BẢNG DANH MỤC SẢN PHẨM (categories)
-- =============================================
CREATE TABLE categories (
    category_id     INT AUTO_INCREMENT PRIMARY KEY,
    category_name   VARCHAR(100)    NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. BẢNG SẢN PHẨM (products)
-- =============================================
CREATE TABLE products (
    product_id      INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT             NOT NULL,
    product_name    VARCHAR(200)    NOT NULL,
    description     TEXT,
    price           DECIMAL(15, 0)  NOT NULL,           -- giá gốc (VNĐ)
    discount        INT             DEFAULT 0,          -- % giảm giá (0-100)
    stock           INT             DEFAULT 0,          -- số lượng tồn kho
    brand           VARCHAR(100),                       -- thương hiệu
    image_url       VARCHAR(500),
    is_active       TINYINT(1)      DEFAULT 1,          -- 1: đang bán, 0: ngừng bán
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- =============================================
-- 3. BẢNG HÌNH ẢNH SẢN PHẨM (product_images)
-- =============================================
CREATE TABLE product_images (
    image_id        INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT             NOT NULL,
    image_url       VARCHAR(500)    NOT NULL,
    is_primary      TINYINT(1)      DEFAULT 0,          -- ảnh đại diện
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =============================================
-- 4. BẢNG NGƯỜI DÙNG (users)
-- =============================================
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(15),
    password        VARCHAR(255)    NOT NULL,            -- mã hóa bcrypt
    address         VARCHAR(300),
    avatar          VARCHAR(500),
    role            ENUM('customer', 'admin') DEFAULT 'customer',
    is_active       TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. BẢNG GIỎ HÀNG (cart)
-- =============================================
CREATE TABLE cart (
    cart_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    added_at        DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =============================================
-- 6. BẢNG ĐƠN HÀNG (orders)
-- =============================================
CREATE TABLE orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    receiver_name   VARCHAR(150)    NOT NULL,
    receiver_phone  VARCHAR(15)     NOT NULL,
    shipping_address VARCHAR(300)   NOT NULL,
    total_amount    DECIMAL(15, 0)  NOT NULL,
    status          ENUM('pending','confirmed','shipping','delivered','cancelled')
                                    DEFAULT 'pending',
    payment_method  ENUM('cod', 'banking') DEFAULT 'cod',
    payment_status  ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    note            TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =============================================
-- 7. BẢNG CHI TIẾT ĐƠN HÀNG (order_details)
-- =============================================
CREATE TABLE order_details (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT             NOT NULL,
    product_id      INT             NOT NULL,
    product_name    VARCHAR(200)    NOT NULL,           -- lưu tên lúc mua
    price           DECIMAL(15, 0)  NOT NULL,           -- lưu giá lúc mua
    quantity        INT             NOT NULL,
    subtotal        DECIMAL(15, 0)  AS (price * quantity) STORED,
    FOREIGN KEY (order_id)   REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =============================================
-- 8. BẢNG ĐÁNH GIÁ SẢN PHẨM (reviews)
-- =============================================
CREATE TABLE reviews (
    review_id       INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT             NOT NULL,
    user_id         INT             NOT NULL,
    rating          INT             NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id)    REFERENCES users(user_id)
);

-- =============================================
-- 9. BẢNG BANNER TRANG CHỦ (banners)
-- =============================================
CREATE TABLE banners (
    banner_id       INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200),
    image_url       VARCHAR(500)    NOT NULL,
    link_url        VARCHAR(500),
    is_active       TINYINT(1)      DEFAULT 1,
    sort_order      INT             DEFAULT 0
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_order_details      ON order_details(order_id);
CREATE INDEX idx_cart_user          ON cart(user_id);
CREATE INDEX idx_reviews_product    ON reviews(product_id);

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

-- Danh mục
INSERT INTO categories (category_name, description, image_url) VALUES
('Đàn Piano',  'Các loại đàn piano cơ và điện tử',          '/images/categories/piano.jpg'),
('Đàn Organ',  'Đàn organ điện tử nhiều chức năng',          '/images/categories/organ.jpg'),
('Đàn Guitar', 'Guitar acoustic, classic và electric',        '/images/categories/guitar.jpg'),
('Đàn Violin', 'Violin cho mọi trình độ',                    '/images/categories/violin.jpg');

-- Tài khoản admin (password: Admin@123)
INSERT INTO users (full_name, email, phone, password, role) VALUES
('Admin', 'admin@musicstore.com', '0900000000',
 '$2b$10$hashedpasswordhere', 'admin');

-- Tài khoản khách hàng mẫu (password: User@123)
INSERT INTO users (full_name, email, phone, password, address, role) VALUES
('Nguyễn Văn An', 'an@gmail.com', '0911111111',
 '$2b$10$hashedpasswordhere2', '123 Đường Lê Lợi, TP.HCM', 'customer'),
('Trần Thị Bình', 'binh@gmail.com', '0922222222',
 '$2b$10$hashedpasswordhere3', '456 Đường Nguyễn Huệ, Hà Nội', 'customer');

-- Sản phẩm mẫu
INSERT INTO products (category_id, product_name, description, price, discount, stock, brand, image_url) VALUES
-- Piano
(1, 'Đàn Piano Yamaha P-45',
   'Đàn piano điện tử 88 phím với âm thanh GH action chân thực, lý tưởng cho người mới học đến nâng cao.',
   12500000, 0, 10, 'Yamaha', '/images/products/piano-yamaha-p45.jpg'),

(1, 'Đàn Piano Casio CDP-S100',
   'Đàn piano điện tử gọn nhẹ, 88 phím, âm thanh trong sáng, phù hợp người mới học.',
   8900000, 5, 15, 'Casio', '/images/products/piano-casio-cdps100.jpg'),

(1, 'Đàn Piano Roland FP-30X',
   'Piano điện Roland 88 phím PHA-4 Standard, Bluetooth, âm thanh SuperNATURAL.',
   18500000, 0, 8, 'Roland', '/images/products/piano-roland-fp30x.jpg'),

-- Organ
(2, 'Đàn Organ Yamaha PSR-E373',
   '61 phím, 622 âm sắc, 205 kiểu đệm tự động, phù hợp học sinh và người mới bắt đầu.',
   5200000, 10, 20, 'Yamaha', '/images/products/organ-yamaha-psre373.jpg'),

(2, 'Đàn Organ Casio CT-X700',
   '61 phím cảm ứng lực, 600 âm sắc, 195 nhịp điệu, màn hình LCD.',
   4800000, 0, 18, 'Casio', '/images/products/organ-casio-ctx700.jpg'),

(2, 'Đàn Organ Yamaha PSR-F52',
   '61 phím mini, 144 âm sắc, chạy pin, nhỏ gọn tiện lợi.',
   2900000, 0, 25, 'Yamaha', '/images/products/organ-yamaha-psrf52.jpg'),

-- Guitar
(3, 'Guitar Acoustic Yamaha F310',
   'Guitar acoustic thân gỗ spruce, cần đàn maple, âm thanh ấm, phù hợp người mới học.',
   1850000, 0, 30, 'Yamaha', '/images/products/guitar-yamaha-f310.jpg'),

(3, 'Guitar Classic Cordoba C3M',
   'Guitar classic nylon string, âm thanh ấm áp, phù hợp nhạc cổ điển và flamenco.',
   3200000, 0, 25, 'Cordoba', '/images/products/guitar-cordoba-c3m.jpg'),

(3, 'Guitar Electric Fender Squier Stratocaster',
   'Guitar điện Stratocaster cổ điển, 3 pickup single-coil, phù hợp nhạc rock và blues.',
   7500000, 5, 12, 'Fender', '/images/products/guitar-fender-squier.jpg'),

-- Violin
(4, 'Violin Stentor Student I 4/4',
   'Violin size 4/4 cho người lớn, bộ hoàn chỉnh kèm cung và hộp đựng.',
   2900000, 0, 12, 'Stentor', '/images/products/violin-stentor-s1.jpg'),

(4, 'Violin Yamaha V3SK 4/4',
   'Violin chuyên nghiệp, âm thanh sáng và ấm, dành cho học sinh trung cấp.',
   6500000, 0, 8, 'Yamaha', '/images/products/violin-yamaha-v3sk.jpg'),

(4, 'Violin Franz Hoffmann Etude 4/4',
   'Violin chất lượng cao, thân làm từ gỗ spruce và maple, âm thanh chuẩn mực.',
   4200000, 10, 10, 'Franz Hoffmann', '/images/products/violin-hoffmann-etude.jpg');

-- Banner trang chủ
INSERT INTO banners (title, image_url, link_url, sort_order) VALUES
('Khuyến mãi Piano tháng 5',  '/images/banners/banner1.jpg', '/products?category=1', 1),
('Guitar cho người mới học',   '/images/banners/banner2.jpg', '/products?category=3', 2),
('Violin chính hãng giá tốt',  '/images/banners/banner3.jpg', '/products?category=4', 3);

-- =============================================
-- CẬP NHẬT PHÂN QUYỀN ADMIN
-- Chạy file này để thêm role mới vào hệ thống
-- =============================================

USE music_store;

-- Cập nhật cột role trong bảng users
ALTER TABLE users
  MODIFY COLUMN role ENUM('customer','staff','admin','super_admin') DEFAULT 'customer';

-- Tạo tài khoản Super Admin (password: SuperAdmin@123)
-- Thay $2b$10$... bằng hash thật khi chạy reset-password.js
INSERT INTO users (full_name, email, phone, password, role) VALUES
('Super Admin', 'superadmin@musicstore.com', '0900000001',
 '$2b$10$hashedpasswordhere_super', 'super_admin')
ON DUPLICATE KEY UPDATE role = 'super_admin';

-- Tạo tài khoản Staff mẫu (password: Staff@123)
INSERT INTO users (full_name, email, phone, password, role) VALUES
('Nhân viên Linh', 'staff.linh@musicstore.com', '0900000002',
 '$2b$10$hashedpasswordhere_staff', 'staff')
ON DUPLICATE KEY UPDATE role = 'staff';

-- =============================================
-- BẢNG PHÂN QUYỀN CHI TIẾT (admin_permissions)
-- Ghi lại ai được làm gì
-- =============================================
CREATE TABLE IF NOT EXISTS admin_permissions (
    permission_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL UNIQUE,
    -- Quản lý cửa hàng
    can_manage_products  TINYINT(1) DEFAULT 0,
    can_manage_orders    TINYINT(1) DEFAULT 0,
    can_manage_users     TINYINT(1) DEFAULT 0,
    -- Quản lý trung tâm
    can_manage_teachers  TINYINT(1) DEFAULT 0,
    can_manage_students  TINYINT(1) DEFAULT 0,
    can_manage_classes   TINYINT(1) DEFAULT 0,
    can_manage_finance   TINYINT(1) DEFAULT 0,  -- Thu học phí, xem doanh thu
    can_view_reports     TINYINT(1) DEFAULT 0,  -- Xem báo cáo thống kê
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Quyền cho Staff mẫu (chỉ quản lý học viên + điểm danh)
INSERT INTO admin_permissions
  (user_id, can_manage_products, can_manage_orders, can_manage_users,
   can_manage_teachers, can_manage_students, can_manage_classes,
   can_manage_finance, can_view_reports)
SELECT user_id, 0, 1, 0, 0, 1, 1, 0, 0
FROM users WHERE email = 'staff.linh@musicstore.com'
ON DUPLICATE KEY UPDATE can_manage_students=1, can_manage_classes=1, can_manage_orders=1;-- =============================================
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
SELECT 'Tạo bảng thành công!' AS result;-- =============================================
-- BẢNG TIN TỨC / BÀI VIẾT (news_posts)
-- Thêm vào database music_store
-- =============================================
USE music_store;

CREATE TABLE IF NOT EXISTS news_posts (
    post_id         INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(300)    NOT NULL,
    slug            VARCHAR(300)    NOT NULL UNIQUE,  -- URL thân thiện
    excerpt         TEXT,                              -- Tóm tắt ngắn
    content         LONGTEXT        NOT NULL,          -- Nội dung HTML đầy đủ
    thumbnail       VARCHAR(500),                      -- Ảnh bìa
    tag             VARCHAR(100),                      -- Piano, Guitar, Sự kiện, Kiến thức...
    is_featured     TINYINT(1)      DEFAULT 0,         -- Bài nổi bật hiện trên đầu
    is_published    TINYINT(1)      DEFAULT 1,         -- 1=công khai, 0=nháp
    views           INT             DEFAULT 0,
    author_id       INT,                               -- user_id admin đăng
    published_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_news_slug      ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_news_featured  ON news_posts(is_featured);

-- Dữ liệu mẫu
INSERT INTO news_posts (title, slug, excerpt, content, tag, is_featured, is_published) VALUES
(
  'Top 5 đàn Piano điện tử tốt nhất cho người mới học năm 2024',
  'top-5-dan-piano-dien-tu-tot-nhat-2024',
  'Bạn đang tìm kiếm cây đàn piano điện tử đầu tiên? Hãy cùng Ascent-Music khám phá 5 mẫu đàn được yêu thích nhất, phù hợp cho mọi lứa tuổi và ngân sách.',
  '<h2>Tại sao nên chọn piano điện tử?</h2>
<p>Piano điện tử là lựa chọn lý tưởng cho người mới bắt đầu vì giá thành hợp lý, không cần chỉnh dây, có thể luyện tập với tai nghe mà không làm phiền người xung quanh.</p>
<h2>Top 5 đàn được khuyến nghị</h2>
<h3>1. Yamaha P-45 — Tốt nhất tầm giá</h3>
<p>Yamaha P-45 sở hữu 88 phím nặng chuẩn, âm thanh AWM Stereo Sampling tuyệt vời với mức giá khoảng 8-9 triệu đồng. Đây là lựa chọn số 1 cho người mới học.</p>
<h3>2. Casio CDP-S100 — Mỏng nhẹ tiện lợi</h3>
<p>Thiết kế siêu mỏng, trọng lượng chỉ 9.7kg, phù hợp cho không gian nhỏ. Giá khoảng 7 triệu đồng.</p>
<h3>3. Roland FP-30X — Chất lượng chuyên nghiệp</h3>
<p>Âm thanh SuperNATURAL Piano, phím PHA-4 Standard mô phỏng cảm giác đàn cơ thật. Giá khoảng 16 triệu đồng.</p>
<h3>4. Korg B2 — Thiết kế đẹp</h3>
<p>88 phím nặng Natural Weighted Hammer Action, loa 15W cho âm thanh đầy đặn. Giá khoảng 9 triệu đồng.</p>
<h3>5. Kawai ES120 — Phím đàn chân thực nhất</h3>
<p>Công nghệ phím RHC (Responsive Hammer Compact) cho cảm giác đàn cơ rất thật. Giá khoảng 13 triệu đồng.</p>
<h2>Kết luận</h2>
<p>Tùy theo ngân sách và nhu cầu, mỗi mẫu đàn đều có ưu điểm riêng. Hãy đến showroom Ascent-Music để được tư vấn và trải nghiệm trực tiếp!</p>',
  'Piano', 1, 1
),
(
  'Hướng dẫn chọn đàn Guitar cho người mới bắt đầu',
  'huong-dan-chon-dan-guitar-cho-nguoi-moi',
  'Guitar acoustic, classic hay electric? Bài viết này sẽ giúp bạn hiểu rõ sự khác biệt và chọn được cây đàn phù hợp nhất.',
  '<h2>Các loại Guitar phổ biến</h2>
<p>Trước khi chọn mua, bạn cần hiểu sự khác biệt giữa 3 dòng guitar chính.</p>
<h3>Guitar Classic (Classic Guitar)</h3>
<p>Dây nylon, âm thanh ấm dịu, phù hợp nhạc cổ điển và dân ca. Đây là loại thường được dạy trong các trường nhạc, rất tốt cho người mới học vì dây mềm, không đau tay.</p>
<h3>Guitar Acoustic</h3>
<p>Dây thép, âm thanh trong sáng và vang hơn guitar classic. Phổ biến trong nhạc pop, folk, country. Thích hợp nếu bạn muốn đệm hát các bài hiện đại.</p>
<h3>Guitar điện (Electric Guitar)</h3>
<p>Cần có amplifier để khuếch đại âm thanh. Dây nhỏ và mềm, phù hợp cho rock, blues, jazz. Nên học acoustic trước rồi mới chuyển sang electric.</p>
<h2>Lời khuyên từ giáo viên Ascent-Music</h2>
<p>Nếu bạn chưa biết mình thích thể loại nào, hãy bắt đầu với Guitar Classic hoặc Acoustic tầm giá 2-4 triệu. Khi đã có nền tảng, việc chuyển sang bất kỳ loại nào cũng rất dễ dàng.</p>',
  'Guitar', 0, 1
),
(
  'Lợi ích bất ngờ khi cho trẻ em học nhạc từ sớm',
  'loi-ich-khi-cho-tre-hoc-nhac-tu-som',
  'Nghiên cứu khoa học chứng minh âm nhạc giúp trẻ phát triển trí não, cảm xúc và kỹ năng xã hội vượt trội. Khám phá ngay những lợi ích bất ngờ!',
  '<h2>Âm nhạc và sự phát triển của trẻ</h2>
<p>Theo nghiên cứu từ Đại học Harvard, trẻ em học nhạc từ nhỏ có khả năng ngôn ngữ, toán học và tư duy logic tốt hơn đáng kể so với trẻ không học nhạc.</p>
<h2>6 lợi ích chính</h2>
<h3>1. Phát triển trí não toàn diện</h3>
<p>Chơi nhạc cụ kích hoạt cả hai bán cầu não cùng lúc, tăng cường kết nối thần kinh và cải thiện trí nhớ.</p>
<h3>2. Rèn luyện sự kiên nhẫn và kỷ luật</h3>
<p>Học nhạc đòi hỏi luyện tập hàng ngày, giúp trẻ hình thành thói quen kỷ luật từ sớm.</p>
<h3>3. Tăng cường sự tự tin</h3>
<p>Biểu diễn trước đám đông giúp trẻ vượt qua nỗi sợ hãi và xây dựng sự tự tin.</p>
<h3>4. Phát triển cảm xúc</h3>
<p>Âm nhạc là ngôn ngữ của cảm xúc, giúp trẻ hiểu và thể hiện cảm xúc của mình một cách lành mạnh.</p>
<h3>5. Kỹ năng xã hội</h3>
<p>Học nhóm và biểu diễn cùng nhau dạy trẻ cách lắng nghe, hợp tác và tôn trọng người khác.</p>
<h3>6. Thành tích học tập tốt hơn</h3>
<p>Trẻ học nhạc thường có điểm Toán và Ngôn ngữ cao hơn trung bình 20-30%.</p>
<h2>Nên cho trẻ học từ mấy tuổi?</h2>
<p>Trẻ từ 4-5 tuổi đã có thể bắt đầu với các lớp âm nhạc cơ bản. Từ 6-7 tuổi phù hợp để học nhạc cụ như piano, violin. Ascent-Music có các lớp thiếu nhi với giáo viên chuyên biệt, vui vẻ và giàu kinh nghiệm.</p>',
  'Kiến thức', 0, 1
);-- =============================================
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
CREATE INDEX IF NOT EXISTS idx_enrollments_class   ON enrollments(class_id);-- =============================================
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