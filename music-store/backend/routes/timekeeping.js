const express = require('express');
const router  = express.Router();
const { getSlots, getByDate, saveRecord, saveDay, getTeacherMonthly, getMonthlyOverview }
    = require('../controllers/timekeepingController');
const { verifyAdmin, verifyStaff } = require('../middleware/auth');

router.get ('/slots',                              verifyStaff, getSlots);
router.get ('/date/:date',                         verifyStaff, getByDate);
router.get ('/monthly/:month',                     verifyStaff, getMonthlyOverview);
router.get ('/teacher/:teacher_id/:month',         verifyStaff, getTeacherMonthly);
router.post('/record',                             verifyAdmin, saveRecord);
router.post('/day',                                verifyAdmin, saveDay);

module.exports = router;
