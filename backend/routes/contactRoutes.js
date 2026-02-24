const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');

// Public: submit contact form
router.post('/', contactController.submitContact);

// Admin: get all submissions
router.get('/', protect, restrictTo('admin', 'superadmin'), contactController.getAllContacts);

module.exports = router;