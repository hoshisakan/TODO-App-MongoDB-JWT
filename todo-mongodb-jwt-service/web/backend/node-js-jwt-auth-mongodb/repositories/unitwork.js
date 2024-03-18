const UserRepository = require('./user.repository');
const RoleRepository = require('./role.repository');
const TodoRepository = require('./todo.repository');
const TodoCategoryRepository = require('./todo.category.repository');
const TraceErrorRespository = require('./trace.error.repository');
const ErrorCategoryRepository = require('./error.category.repository');
const ProfileRepository = require('./profile.repository');
const TodoStatusRepository = require('./todo.status.repository');

const db = require('../models/mongodb');
const User = db.user;
const Role = db.role;
const Todo = db.todo;
const TodoCategory = db.todoCategory;
const TraceError = db.traceError;
const ErrorCategory = db.errorCategory;
const Profile = db.profile;
const TodoStatus = db.todoStatus;

class UnitOfWork {
    constructor() {
        this.db = db;
        this.users = new UserRepository(User);
        this.roles = new RoleRepository(Role);
        this.todos = new TodoRepository(Todo);
        this.todoCategories = new TodoCategoryRepository(TodoCategory);
        this.traceErrors = new TraceErrorRespository(TraceError);
        this.errorCategories = new ErrorCategoryRepository(ErrorCategory);
        this.profiles = new ProfileRepository(Profile);
        this.todoStatuses = new TodoStatusRepository(TodoStatus);
    }

    async complete() {
        await this.db.mongoose.connection.close();
    }
}

module.exports = UnitOfWork;
