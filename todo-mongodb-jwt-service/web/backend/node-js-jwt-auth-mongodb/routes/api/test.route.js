const { authJwt } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { testController } = require('./base.route');

router.get('/all', testController.allAccess);

router.get('/user', [authJwt.verifyAcccessToken], testController.userBoard);

router.get('/mod', [authJwt.verifyAcccessToken, authJwt.isModerator], testController.moderatorBoard);

router.get('/admin', [authJwt.verifyAcccessToken, authJwt.isAdmin], testController.adminBoard);

module.exports = router;
