const { authJwt } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { testController } = require('./base.route');

router.get('/all', testController.allAccess);

router.get('/user', [authJwt.verifyToken], testController.userBoard);

router.get('/mod', [authJwt.verifyToken, authJwt.isModerator], testController.moderatorBoard);

router.get('/admin', [authJwt.verifyToken, authJwt.isAdmin], testController.adminBoard);

module.exports = router;
