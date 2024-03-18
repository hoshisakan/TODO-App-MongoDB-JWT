const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { profileController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.findAll);
// router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.findById);
// router.post('/', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.create);
// router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.updateById);
// router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], profileController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.deleteById);
// router.post('/bulk-create', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.bulkCreate);
// router.put('/bulk-update', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.bulkUpdate);
router.get('/get-profile', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.getProfile);
router.post('/set-profile', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.setProfile);
router.post('/upload-photo', [authJwt.verifyAcccessToken, authJwt.isUser], profileController.uploadPhoto);

module.exports = router;
