const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoController.findAll);
// router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoController.findOne);

module.exports = router;
