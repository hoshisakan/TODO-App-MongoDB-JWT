const AuthController = require('../../controllers/auth.controller');
const UserController = require('../../controllers/user.controller');
const RoleController = require('../../controllers/role.controller');


const authController = new AuthController();
const userController = new UserController();
const roleController = new RoleController();


module.exports = {
    authController,
    userController,
    roleController,
};
