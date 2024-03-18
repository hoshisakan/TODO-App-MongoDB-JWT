const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoStatusController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isUser], todoStatusController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.deleteById);
router.post('/bulk-create', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.bulkCreate);
// router.put('/bulk-update', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoStatusController.bulkUpdate);

module.exports = router;
