const jwt = require('jsonwebtoken');
require('dotenv').config();

// Xác thực token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// Phân cấp: customer < staff < admin < super_admin
const ROLES = { customer: 0, staff: 1, admin: 2, super_admin: 3 };

const requireRole = (minRole) => (req, res, next) => {
    verifyToken(req, res, () => {
        const userLevel = ROLES[req.user.role] ?? 0;
        if (userLevel >= (ROLES[minRole] ?? 99)) return next();
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện!' });
    });
};

// verifyAdmin: cho phép admin + super_admin (backward compatible)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
    });
};

const verifySuperAdmin = requireRole('super_admin');
const verifyStaff      = requireRole('staff');

// Kiểm tra quyền chi tiết cho Staff
const db = require('../config/db');
const verifyPermission = (permField) => async (req, res, next) => {
    verifyToken(req, res, async () => {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
        if (req.user.role === 'staff') {
            try {
                const [[perm]] = await db.query(
                    `SELECT ${permField} AS allowed FROM admin_permissions WHERE user_id = ?`,
                    [req.user.user_id]
                );
                if (perm?.allowed) return next();
            } catch {}
        }
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện!' });
    });
};

module.exports = { verifyToken, verifyAdmin, verifySuperAdmin, verifyStaff, verifyPermission, requireRole };
