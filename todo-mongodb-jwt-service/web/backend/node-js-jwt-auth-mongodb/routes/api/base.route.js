const AuthController = require('../../controllers/auth.controller');
const TestController = require('../../controllers/test.controller');
const UserController = require('../../controllers/user.controller');
const RoleController = require('../../controllers/role.controller');
const TodoController = require('../../controllers/todo.controller');
const TodoCategoryController = require('../../controllers/todo.category.controller');

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
