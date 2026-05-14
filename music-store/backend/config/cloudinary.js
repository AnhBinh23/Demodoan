const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho ảnh sản phẩm
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'ascent-music/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

// Storage cho ảnh danh mục
const categoryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'ascent-music/categories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 600, height: 400, crop: 'limit' }],
    },
});

// Storage cho ảnh bìa sheet nhạc
const sheetThumbStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'ascent-music/sheets/thumbnails',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

// Storage cho file PDF sheet nhạc
const sheetFileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'ascent-music/sheets/files',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        resource_type:  'auto', // auto detect pdf or image
    },
});

module.exports = {
    uploadProductImage: multer({ storage: productStorage }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'thumb_images', maxCount: 4 },
]),
    uploadCategoryImage: multer({ storage: categoryStorage }).single('image'),
    uploadSheetThumb:    multer({ storage: sheetThumbStorage }).single('thumbnail'),
    uploadSheetFile:     multer({ storage: sheetFileStorage  }).single('sheet_file'),
    uploadSheet: multer({
        storage: multer.memoryStorage(),
    }).fields([
        { name: 'sheet_file', maxCount: 1 },
        { name: 'thumbnail',  maxCount: 1 },
    ]),
    cloudinary, // export để dùng xóa ảnh
};