const router = require('express').Router();

router.use('/auth', require('./api/auth.route'));
router.use('/test', require('./api/test.route'));
router.use('/user', require('./api/user.route'));
router.use('/role', require('./api/role.route'));
router.use('/todo', require('./api/todo.route'));
router.use('/todoCategory', require('./api/todo.category.route'));
router.use('/todoStatus', require('./api/todo.status.route'));
router.use('/errorCategory', require('./api/error.category.route'));
router.use('/traceError', require('./api/trace.error.route'));
router.use('/profile', require('./api/profile.route'));

module.exports = router;
