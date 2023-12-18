const router = require('express').Router();
const { roleController } = require('./base.route');

router.get('/', roleController.findAll);


module.exports = router;
