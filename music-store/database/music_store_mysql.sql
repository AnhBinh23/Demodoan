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
ON DUPLICATE KEY UPDATE can_manage_students=1, can_manage_classes=1, can_manage_orders=1;