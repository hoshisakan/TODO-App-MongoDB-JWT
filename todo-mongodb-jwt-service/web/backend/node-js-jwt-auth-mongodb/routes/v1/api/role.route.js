const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { roleController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.findAll);

module.exports = router;
