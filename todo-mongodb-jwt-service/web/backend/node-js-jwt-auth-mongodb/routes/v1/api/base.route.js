const AuthController = require('../../../controllers/v1/auth.controller');
const TestController = require('../../../controllers/v1/test.controller');
const UserController = require('../../../controllers/v1/user.controller');
const RoleController = require('../../../controllers/v1/role.controller');
const TodoController = require('../../../controllers/v1/todo.controller');
const TodoCategoryController = require('../../../controllers/v1/todo.category.controller');
const TodoStatusController = require('../../../controllers/v1/todo.status.controller');
const ErrorCategoryController = require('../../../controllers/v1/error.category.controller');
const TraceErrorController = require('../../../controllers/v1/trace.error.controller');
const ProfileController = require('../../../controllers/v1/profile.controller');

const authController = new AuthController();
const testController = new TestController();
const userController = new UserController();
const roleController = new RoleController();
const todoController = new TodoController();
const todoCategoryController = new TodoCategoryController();
const todoStatusController = new TodoStatusController();
const errorCategoryController = new ErrorCategoryController();
const traceErrorController = new TraceErrorController();
const profileController = new ProfileController();

module.exports = {
    authController,
    testController,
    userController,
    roleController,
    todoController,
    todoCategoryController,
    todoStatusController,
    errorCategoryController,
    traceErrorController,
    profileController,
};
