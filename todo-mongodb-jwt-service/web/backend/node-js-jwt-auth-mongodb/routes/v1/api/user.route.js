const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { userController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], userController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], userController.findById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], userController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], userController.deleteById);

module.exports = router;
