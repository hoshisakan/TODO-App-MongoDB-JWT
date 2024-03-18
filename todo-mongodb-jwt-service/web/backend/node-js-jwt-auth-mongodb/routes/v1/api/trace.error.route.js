const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { traceErrorController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.deleteById);
router.post('/bulk-create', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.bulkCreate);
// router.put('/bulk-update', [authJwt.verifyAcccessToken, authJwt.isAdmin], traceErrorController.bulkUpdate);

module.exports = router;
