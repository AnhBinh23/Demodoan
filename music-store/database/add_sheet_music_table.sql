-- Thêm bảng bản nhạc vào database music_store
USE music_store;

CREATE TABLE IF NOT EXISTS sheet_music (
    sheet_id      INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200)    NOT NULL,           -- Tên bản nhạc
    composer      VARCHAR(150),                       -- Tác giả / Soạn giả
    instrument    VARCHAR(100),                       -- Nhạc cụ (Piano, Guitar...)
    difficulty    ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    description   TEXT,                               -- Mô tả
    file_url      VARCHAR(500)    NOT NULL,           -- Đường dẫn file PDF/ảnh
    file_type     VARCHAR(10)     DEFAULT 'pdf',      -- 'pdf' hoặc 'image'
    thumbnail_url VARCHAR(500),                       -- Ảnh bìa
    is_free       TINYINT(1)      DEFAULT 1,          -- 1: miễn phí
    view_count    INT             DEFAULT 0,          -- Lượt xem
    is_active     TINYINT(1)      DEFAULT 1,
    created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu
INSERT INTO sheet_music (title, composer, instrument, difficulty, description, file_url, file_type, is_free) VALUES
('Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Nguyễn Nhất Huy', 'Piano', 'beginner', 'Bản nhạc piano đơn giản cho người mới học', '/sheets/cho-toi-xin.pdf', 'pdf', 1),
('See You Again', 'Charlie Puth', 'Piano', 'intermediate', 'Bản piano nổi tiếng từ phim Fast & Furious', '/sheets/see-you-again.pdf', 'pdf', 1),
('Cô Đơn Dành Cho Ai', 'Vũ', 'Guitar', 'beginner', 'Hợp âm guitar cơ bản cho người mới', '/sheets/co-don-danh-cho-ai.pdf', 'pdf', 1),
('Canon in D', 'Johann Pachelbel', 'Violin', 'intermediate', 'Tác phẩm cổ điển nổi tiếng cho violin', '/sheets/canon-in-d.pdf', 'pdf', 1),
('Fur Elise', 'Ludwig van Beethoven', 'Piano', 'intermediate', 'Tác phẩm piano kinh điển của Beethoven', '/sheets/fur-elise.pdf', 'pdf', 1),
('Despacito', 'Luis Fonsi', 'Guitar', 'beginner', 'Bản guitar acoustic phiên bản đơn giản', '/sheets/despacito.pdf', 'pdf', 1);
