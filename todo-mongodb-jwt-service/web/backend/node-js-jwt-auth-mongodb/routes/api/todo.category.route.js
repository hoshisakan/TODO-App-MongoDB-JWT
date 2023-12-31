const { authJwt } = require('../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoCategoryController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.findAll);
// router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.findOne);


module.exports = router;