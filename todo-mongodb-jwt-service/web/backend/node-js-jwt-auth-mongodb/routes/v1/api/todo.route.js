const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken], todoController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken], todoController.findById);
router.post('/', [authJwt.verifyAcccessToken], todoController.create);
router.put('/:id', [authJwt.verifyAcccessToken], todoController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken], todoController.patchUpdateById);
router.delete('/:id', [authJwt.verifyAcccessToken], todoController.deleteById);
router.post('/bulkCreate', [authJwt.verifyAcccessToken], todoController.bulkCreate);
// router.put('/bulkUpdate', [authJwt.verifyAcccessToken], todoController.bulkUpdate);

module.exports = router;