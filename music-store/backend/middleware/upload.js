const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Tạo thư mục nếu chưa có
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Cấu hình storage cho ảnh sản phẩm
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/images/products');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'product_' + Date.now() + ext);
    }
});

// Cấu hình storage cho ảnh danh mục
const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/images/categories');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'category_' + Date.now() + ext);
    }
});

// Cấu hình storage cho sheet nhạc
const sheetStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir;
        if (file.fieldname === 'thumbnail') {
            dir = path.join(__dirname, '../public/images/sheets');
        } else {
            dir = path.join(__dirname, '../public/sheets');
        }
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const prefix = file.fieldname === 'thumbnail' ? 'thumb_' : 'sheet_';
        cb(null, prefix + Date.now() + ext);
    }
});

// Filter chỉ cho phép ảnh
const imageFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!'), false);
};

// Filter cho sheet nhạc (PDF + ảnh)
const sheetFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận PDF hoặc ảnh!'), false);
};

module.exports = {
    uploadProductImage:  multer({ storage: productStorage,  fileFilter: imageFilter, limits: { fileSize: 5  * 1024 * 1024 } }).single('image'),
    uploadCategoryImage: multer({ storage: categoryStorage, fileFilter: imageFilter, limits: { fileSize: 5  * 1024 * 1024 } }).single('image'),
    uploadSheet:         multer({ storage: sheetStorage,    fileFilter: sheetFilter, limits: { fileSize: 20 * 1024 * 1024 } }).fields([
        { name: 'sheet_file', maxCount: 1 },
        { name: 'thumbnail',  maxCount: 1 },
    ]),
};