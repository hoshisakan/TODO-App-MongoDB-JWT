const { verifySignUp, authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { authController } = require('./base.route');

router.post(
    '/signup',
    // [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
    [verifySignUp.checkDuplicateUsernameOrEmail],
    authController.signup
);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.get('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
router.get('/current-user', [authJwt.verifyAcccessToken, authJwt.isUser], authController.getCurrentUser);
router.post('/verify-reset-password-token', authController.verifyResetPasswordToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/re-send-confirm-email', authController.reSendConfirmEmail);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
