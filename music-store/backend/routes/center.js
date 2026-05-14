const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { verifyAdmin, verifySuperAdmin, verifyStaff, verifyPermission } = require('../middleware/auth');
const T = require('../controllers/teacherController');
const S = require('../controllers/studentController');
const C = require('../controllers/centerController');

// Upload avatar giáo viên qua memory (controller tự upload Cloudinary)
const uploadTeacher = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } }).single('avatar');

// INSTRUMENTS & COURSE TYPES
router.get('/instruments',   verifyStaff, C.getInstruments);
router.get('/course-types',  verifyStaff, C.getCourseTypes);

// TEACHERS
router.get   ('/teachers',     verifyStaff,  T.getAll);
router.get   ('/teachers/:id', verifyStaff,  T.getById);
router.post  ('/teachers',     verifyPermission('can_manage_teachers'), uploadTeacher, T.create);
router.put   ('/teachers/:id', verifyPermission('can_manage_teachers'), uploadTeacher, T.update);
router.delete('/teachers/:id', verifyAdmin,  T.remove);

// STUDENTS
router.get   ('/students',     verifyStaff,  S.getAll);
router.get   ('/students/:id', verifyStaff,  S.getById);
router.post  ('/students',     verifyPermission('can_manage_students'), S.create);
router.put   ('/students/:id', verifyPermission('can_manage_students'), S.update);
router.delete('/students/:id', verifyAdmin,  S.remove);

// COURSES
router.get   ('/courses',      verifyStaff,  C.getAllCourses);
router.post  ('/courses',      verifyAdmin,  C.createCourse);
router.put   ('/courses/:id',  verifyAdmin,  C.updateCourse);
router.delete('/courses/:id',  verifyAdmin,  C.deleteCourse);

// CLASSES
router.get   ('/classes',      verifyStaff,  C.getAllClasses);
router.get   ('/classes/:id',  verifyStaff,  C.getClassDetail);
router.post  ('/classes',      verifyPermission('can_manage_classes'), C.createClass);
router.put   ('/classes/:id',  verifyPermission('can_manage_classes'), C.updateClass);

// ENROLLMENTS
router.post  ('/enrollments',      verifyPermission('can_manage_students'), C.enrollStudent);
router.put   ('/enrollments/:id',  verifyPermission('can_manage_students'), C.updateEnrollment);

// TUITION PAYMENTS
router.get   ('/payments/:enrollment_id', verifyStaff, C.getPaymentsByEnrollment);
router.post  ('/payments',                verifyPermission('can_manage_finance'), C.addPayment);

// SESSIONS & ATTENDANCE
router.post  ('/sessions',                        verifyPermission('can_manage_classes'), C.createSession);
router.post  ('/attendance',                      verifyStaff, C.saveAttendance);
router.get   ('/attendance/session/:session_id',  verifyStaff, C.getAttendanceBySession);
router.get   ('/attendance/student/:student_id',  verifyStaff, C.getAttendanceByStudent);

// ADMIN PERMISSIONS
router.get   ('/admins',              verifySuperAdmin, C.getAdmins);
router.post  ('/admins/permissions',  verifySuperAdmin, C.updateAdminPermissions);

module.exports = router;
