const router = require('express').Router();

router.use('/auth', require('./api/auth.route'));
router.use('/test', require('./api/test.route'));

module.exports = router;
