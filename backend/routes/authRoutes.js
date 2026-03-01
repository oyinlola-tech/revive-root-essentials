const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const {
  registerValidation,
  loginValidation,
  sendOtpValidation,
  verifyOtpValidation,
  changePasswordValidation,
  resetPasswordValidation,
  resetPasswordConfirmValidation,
} = require('../validations/authValidation');

router.post('/register', validate(registerValidation), authController.register);
router.post('/send-otp', validate(sendOtpValidation), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpValidation), authController.verifyOtp);
router.post('/login', validate(loginValidation), authController.login);
router.post('/oauth/google', authController.oauthGoogle);
router.post('/oauth/apple', authController.oauthApple);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);
router.post('/reset-password/confirm', validate(resetPasswordConfirmValidation), authController.resetPasswordConfirm);
router.post('/change-password', protect, validate(changePasswordValidation), authController.changePassword);

module.exports = router;
