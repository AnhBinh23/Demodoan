-- =============================================
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
);