const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { errorCategoryController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.deleteById);
router.post('/bulkCreate', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.bulkCreate);
// router.put('/bulkUpdate', [authJwt.verifyAcccessToken, authJwt.isAdmin], errorCategoryController.bulkUpdate);

module.exports = router;
