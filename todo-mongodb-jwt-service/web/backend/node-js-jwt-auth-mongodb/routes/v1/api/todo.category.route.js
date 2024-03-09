const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoCategoryController } = require('./base.route');

router.get('/', [verifyAcccessToken, isAdmin], todoCategoryController.findAll);
router.get('/:id', [verifyAcccessToken, isAdmin], todoCategoryController.findById);
router.post('/', [verifyAcccessToken, isAdmin], todoCategoryController.create);
router.put('/:id', [verifyAcccessToken, isAdmin], todoCategoryController.updateById);
router.patch('/:id', [verifyAcccessToken, isAdmin], todoCategoryController.patchUpdateById);
router.delete('/', [verifyAcccessToken, isAdmin], todoCategoryController.deleteAll);
router.delete('/:id', [verifyAcccessToken, isAdmin], todoCategoryController.deleteById);
router.post('/bulkCreate', [verifyAcccessToken, isAdmin], todoCategoryController.bulkCreate);
// router.put('/bulkUpdate', [verifyAcccessToken, isAdmin], todoCategoryController.bulkUpdate);

module.exports = router;
