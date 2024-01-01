const AuthController = require('../../../controllers/v1/auth.controller');
const TestController = require('../../../controllers/v1/test.controller');
const UserController = require('../../../controllers/v1/user.controller');
const RoleController = require('../../../controllers/v1/role.controller');
const TodoController = require('../../../controllers/v1/todo.controller');
const TodoCategoryController = require('../../../controllers/v1/todo.category.controller');

const authController = new AuthController();
const testController = new TestController();
const userController = new UserController();
const roleController = new RoleController();
const todoController = new TodoController();
const todoCategoryController = new TodoCategoryController();

module.exports = {
    authController,
    testController,
    userController,
    roleController,
    todoController,
    todoCategoryController,
};