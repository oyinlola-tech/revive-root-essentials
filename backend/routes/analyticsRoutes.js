const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/dashboard', analyticsController.getDashboard);
router.get('/sales', analyticsController.getSales);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/users', analyticsController.getUserAnalytics);

module.exports = router;