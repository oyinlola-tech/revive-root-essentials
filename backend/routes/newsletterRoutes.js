const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');

// Public: subscribe
router.post('/subscribe', newsletterController.subscribe);

// Admin: get subscribers
router.get('/subscribers', protect, restrictTo('admin', 'superadmin'), newsletterController.getAllSubscribers);

module.exports = router;