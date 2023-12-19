const { verifySignUp } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { authController } = require('./base.route');

router.post(
    '/signup',
    [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
    authController.signup
);
router.post('/signin', authController.signin);

module.exports = router;
