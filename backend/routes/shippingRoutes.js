const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');

router.post('/quote', shippingController.quoteShippingFee);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/', shippingController.getAllShippingFees);
router.post('/', shippingController.createShippingFee);
router.put('/:id', shippingController.updateShippingFee);
router.delete('/:id', shippingController.deleteShippingFee);

module.exports = router;
