const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// ================= CONFIG CLOUDINARY =================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= STORAGE ẢNH SẢN PHẨM =================
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'ascent-music/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    }),
});

// ================= STORAGE ẢNH DANH MỤC =================
const categoryStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'ascent-music/categories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 600, height: 400, crop: 'limit' }],
    }),
});

// ================= STORAGE THUMBNAIL SHEET =================
const sheetThumbStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'ascent-music/sheets/thumbnails',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }),
});

// ================= STORAGE FILE SHEET =================
const sheetFileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'ascent-music/sheets/files',
        resource_type: 'auto',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    }),
});

// ================= MULTER =================
const uploadProductImage = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single('image');

const uploadCategoryImage = multer({
    storage: categoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single('image');

const uploadSheetThumb = multer({
    storage: sheetThumbStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single('thumbnail');

const uploadSheetFile = multer({
    storage: sheetFileStorage,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
}).single('sheet_file');

// Upload cả thumbnail + pdf
const uploadSheet = multer({
    storage: multer.memoryStorage(),
}).fields([
    { name: 'sheet_file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);

module.exports = {
    cloudinary,
    uploadProductImage,
    uploadCategoryImage,
    uploadSheetThumb,
    uploadSheetFile,
    uploadSheet,
};