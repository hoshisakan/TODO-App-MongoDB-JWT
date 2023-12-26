const { verifySignUp } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { authController } = require('./base.route');

router.post(
    '/signup',
    [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
    authController.signup
);
router.post('/signin', authController.signin);
// router.get('/signout', authController.signout);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
// router.post('/verify-account', authController.verifyAccount);
// router.post('/verify-email', authController.verifyEmail);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;
