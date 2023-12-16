const router = require('express').Router();

router.use('/auth', require('./api/auth.routes'));
router.use('/test', require('./api/user.routes'));

module.exports = router;
