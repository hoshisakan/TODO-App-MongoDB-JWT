const { authJwt } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { userController } = require('./base.route');

router.get('/', [authJwt.verifyToken, authJwt.isAdmin], userController.findAll);


module.exports = router;
