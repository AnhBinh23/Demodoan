const express = require('express');
const router  = express.Router();
const N = require('../controllers/newsController');
const { verifyAdmin, verifyStaff } = require('../middleware/auth');

// Public
router.get('/tags',          N.getTags);
router.get('/',              N.getAll);
router.get('/slug/:slug',    N.getBySlug);

// Admin
router.get   ('/admin/all',      verifyStaff, N.adminGetAll);
router.get   ('/admin/:id',      verifyStaff, N.adminGetById);
router.post  ('/',               verifyAdmin, N.create);
router.put   ('/:id',            verifyAdmin, N.update);
router.delete('/:id',            verifyAdmin, N.remove);
router.patch ('/:id/toggle',     verifyAdmin, N.togglePublish);

module.exports = router;