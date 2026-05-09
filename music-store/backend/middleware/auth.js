const jwt = require('jsonwebtoken');
require('dotenv').config();

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

const ROLES = { customer: 0, staff: 1, admin: 2, super_admin: 3 };

const requireRole = (minRole) => (req, res, next) => {
    verifyToken(req, res, () => {
        const userLevel = ROLES[req.user.role] ?? 0;
        if (userLevel >= (ROLES[minRole] ?? 99)) return next();
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện!' });
    });
};

const verifyAdmin      = requireRole('admin');
const verifySuperAdmin = requireRole('super_admin');
const verifyStaff      = requireRole('staff');

const db = require('../config/db');
const verifyPermission = (permField) => async (req, res, next) => {
    verifyToken(req, res, async () => {
        if (['super_admin','admin'].includes(req.user.role)) return next();
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
