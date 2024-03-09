const { authJwt } = require('../../../middlewares/authJwt.middleware');
const router = require('express').Router();
const { todoController } = require('./base.route');

router.get('/', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.findAll);
router.get('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.findById);
router.post('/', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.create);
router.put('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.updateById);
router.patch('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.patchUpdateById);
router.delete('/', [authJwt.verifyAcccessToken, authJwt.isAdmin], todoController.deleteAll);
router.delete('/:id', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.deleteById);
router.post('/bulkCreate', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.bulkCreate);
// router.put('/bulkUpdate', [authJwt.verifyAcccessToken, authJwt.isUser], todoController.bulkUpdate);

module.exports = router;