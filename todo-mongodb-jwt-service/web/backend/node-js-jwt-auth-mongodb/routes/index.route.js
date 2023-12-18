const router = require('express').Router();

router.use('/auth', require('./api/auth.route'));
router.use('/test', require('./api/test.route'));
router.use('/user', require('./api/user.route'));
router.use('/role', require('./api/role.route'));

module.exports = router;
