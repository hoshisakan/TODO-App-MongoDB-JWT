const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoCategoryController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isUser], todoCategoryController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.deleteById);
router.post('/bulk-create', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.bulkCreate);
// router.put('/bulk-update', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoCategoryController.bulkUpdate);

module.exports = router;
