const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { subscribeValidation, unsubscribeValidation } = require('../validations/newsletterValidation');

// Public: subscribe
router.post('/subscribe', validate(subscribeValidation), newsletterController.subscribe);
router.get('/unsubscribe', validate(unsubscribeValidation), newsletterController.unsubscribe);

// Admin: get subscribers
router.get('/subscribers', protect, restrictTo('admin', 'superadmin'), newsletterController.getAllSubscribers);
router.post('/send-now', protect, restrictTo('superadmin'), newsletterController.sendCampaignNow);

module.exports = router;
