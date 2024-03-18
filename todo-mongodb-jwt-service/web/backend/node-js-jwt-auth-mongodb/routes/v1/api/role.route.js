const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { roleController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.deleteById);
router.post('/bulk-create', [authJwt.verifyAcccessToken, authJwt.isAdmin], roleController.bulkCreate);

module.exports = router;
