const { verifySignUp } = require('../../middlewares/authJwt');
const controller = require('../../controllers/auth.controller');
const router = require('express').Router();

router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], controller.signup);
router.post('/signin', controller.signin);

module.exports = router;
