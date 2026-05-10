const toSlug = (str) => str.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,'a')
    .replace(/[èéẹẻẽêềếệểễ]/g,'e')
    .replace(/[ìíịỉĩ]/g,'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,'o')
    .replace(/[ùúụủũưừứựửữ]/g,'u')
    .replace(/[ỳýỵỷỹ]/g,'y')
    .replace(/đ/g,'d')
    .replace(/[^a-z0-9\s-]/g,'')
    .trim().replace(/\s+/g,'-');

// ===== PUBLIC =====
const getAll = async (req, res) => {
    try {
        const { page=1, limit=9, tag, search } = req.query;
        const offset = (page-1)*limit;
        let where = 'WHERE p.is_published=1';
        const params = [];
        if (tag)    { where += ' AND p.tag=?';                           params.push(tag); }
        if (search) { where += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)'; const q='%'+search+'%'; params.push(q,q); }

        const [[{total}]] = await db.query(
            `SELECT COUNT(*) as total FROM news_posts p ${where}`, params);

        const [posts] = await db.query(
            `SELECT p.post_id, p.title, p.slug, p.excerpt, p.thumbnail,
                    p.tag, p.is_featured, p.views, p.published_at,
                    u.full_name AS author_name
             FROM news_posts p
             LEFT JOIN users u ON p.author_id=u.user_id
             ${where}
             ORDER BY p.is_featured DESC, p.published_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );
        res.json({ posts, total, page: parseInt(page), total_pages: Math.ceil(total/limit) });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const getBySlug = async (req, res) => {
    try {
        const [[post]] = await db.query(
            `SELECT p.*, u.full_name AS author_name
             FROM news_posts p
             LEFT JOIN users u ON p.author_id=u.user_id
             WHERE p.slug=? AND p.is_published=1`, [req.params.slug]);
        if (!post) return res.status(404).json({ message:'Không tìm thấy bài viết!' });
        // Tăng lượt xem
        await db.query('UPDATE news_posts SET views=views+1 WHERE post_id=?', [post.post_id]);
        // Bài liên quan (cùng tag)
        const [related] = await db.query(
            `SELECT post_id, title, slug, thumbnail, tag, published_at
             FROM news_posts
             WHERE tag=? AND post_id!=? AND is_published=1
             ORDER BY published_at DESC LIMIT 3`, [post.tag, post.post_id]);
        res.json({ ...post, related });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const getTags = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tag, COUNT(*) as count FROM news_posts
             WHERE is_published=1 AND tag IS NOT NULL
             GROUP BY tag ORDER BY count DESC`);
        res.json(rows);
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

// ===== ADMIN =====
const adminGetAll = async (req, res) => {
    try {
        const { page=1, limit=20, search } = req.query;
        const offset = (page-1)*limit;
        let where = 'WHERE 1=1';
        const params = [];
        if (search) { where += ' AND p.title LIKE ?'; params.push('%'+search+'%'); }
        const [[{total}]] = await db.query(
            `SELECT COUNT(*) as total FROM news_posts p ${where}`, params);
        const [posts] = await db.query(
            `SELECT p.post_id, p.title, p.slug, p.tag, p.is_featured,
                    p.is_published, p.views, p.published_at,
                    u.full_name AS author_name
             FROM news_posts p LEFT JOIN users u ON p.author_id=u.user_id
             ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );
        res.json({ posts, total, page: parseInt(page), total_pages: Math.ceil(total/limit) });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const adminGetById = async (req, res) => {
    try {
        const [[post]] = await db.query(
            'SELECT * FROM news_posts WHERE post_id=?', [req.params.id]);
        if (!post) return res.status(404).json({ message:'Không tìm thấy!' });
        res.json(post);
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const create = async (req, res) => {
    try {
        const { title, excerpt, content, thumbnail, tag, is_featured, is_published } = req.body;
        if (!title || !content) return res.status(400).json({ message:'Thiếu tiêu đề hoặc nội dung!' });
        // Tạo slug duy nhất
        let slug = toSlug(title);
        const [[{cnt}]] = await db.query(
            'SELECT COUNT(*) as cnt FROM news_posts WHERE slug=?', [slug]);
        if (cnt > 0) slug = slug + '-' + Date.now();

        const [r] = await db.query(
            `INSERT INTO news_posts
                (title,slug,excerpt,content,thumbnail,tag,is_featured,is_published,author_id)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [title, slug, excerpt||null, content, thumbnail||null,
             tag||null, is_featured?1:0, is_published?1:0, req.user.user_id]
        );
        res.status(201).json({ message:'Đăng bài thành công!', post_id: r.insertId, slug });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const update = async (req, res) => {
    try {
        const { title, excerpt, content, thumbnail, tag, is_featured, is_published } = req.body;
        const [[old]] = await db.query('SELECT * FROM news_posts WHERE post_id=?', [req.params.id]);
        if (!old) return res.status(404).json({ message:'Không tìm thấy!' });

        let slug = old.slug;
        if (title && title !== old.title) {
            slug = toSlug(title);
            const [[{cnt}]] = await db.query(
                'SELECT COUNT(*) as cnt FROM news_posts WHERE slug=? AND post_id!=?', [slug, req.params.id]);
            if (cnt > 0) slug = slug + '-' + Date.now();
        }
        await db.query(
            `UPDATE news_posts SET title=?,slug=?,excerpt=?,content=?,thumbnail=?,
                tag=?,is_featured=?,is_published=?,updated_at=NOW()
             WHERE post_id=?`,
            [title||old.title, slug, excerpt||null, content||old.content,
             thumbnail||old.thumbnail, tag||null, is_featured?1:0, is_published?1:0, req.params.id]
        );
        res.json({ message:'Cập nhật thành công!', slug });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const remove = async (req, res) => {
    try {
        await db.query('DELETE FROM news_posts WHERE post_id=?', [req.params.id]);
        res.json({ message:'Đã xóa bài viết!' });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

const togglePublish = async (req, res) => {
    try {
        await db.query(
            'UPDATE news_posts SET is_published = NOT is_published WHERE post_id=?', [req.params.id]);
        res.json({ message:'Đã thay đổi trạng thái!' });
    } catch(e) { res.status(500).json({ message:'Lỗi server!', error:e.message }); }
};

module.exports = { getAll, getBySlug, getTags, adminGetAll, adminGetById, create, update, remove, togglePublish };