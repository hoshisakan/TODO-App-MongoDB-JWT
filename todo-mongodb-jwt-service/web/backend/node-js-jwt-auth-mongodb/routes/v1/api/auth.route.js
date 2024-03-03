const { verifySignUp } = require('../../../middlewares/authJwt.middleware');
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
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
router.get('/account-info', authController.getCurrentUser);
router.get('/verify-reset-password', authController.verifyResetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/re-send-confirm-email', authController.reSendConfirmEmail);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
