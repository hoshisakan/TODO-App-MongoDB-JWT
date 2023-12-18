const router = require('express').Router();
const { userController } = require('./base.route');

router.get('/', userController.findAll);


module.exports = router;
