const express = require('express');
const router  = express.Router();
const { resendEnrollEmail, sendDebtReminder, sendBulkDebtReminder } = require('../controllers/emailController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/enroll/:enrollment_id/resend', verifyAdmin, resendEnrollEmail);
router.post('/debt/:enrollment_id',          verifyAdmin, sendDebtReminder);
router.post('/debt-bulk',                    verifyAdmin, sendBulkDebtReminder);

module.exports = router;
