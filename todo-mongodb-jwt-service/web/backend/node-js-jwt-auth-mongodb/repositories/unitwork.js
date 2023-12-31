const UserRepository = require('./user.repository');
const RoleRepository = require('./role.repository');
const TodoRepository = require('./todo.repository');
const TodoCategoryRepository = require('./todo.category.repository');


const db = require('../models/mongodb');
const User = db.user;
const Role = db.role;
const Todo = db.todo;
const TodoCategory = db.todoCategory;


class UnitOfWork {
    constructor() {
        this.db = db;
        this.users = new UserRepository(User);
        this.roles = new RoleRepository(Role);
        this.todos = new TodoRepository(Todo);
        this.todoCategories = new TodoCategoryRepository(TodoCategory);
    }

    async complete() {
        await this.db.mongoose.connection.close();
    }
}

module.exports = UnitOfWork;