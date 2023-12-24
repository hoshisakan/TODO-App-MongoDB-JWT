const UserRepository = require('./user.repository');
const RoleRepository = require('./role.repository');
// const TodoRepository = require('./todo-repository');

const db = require('../models/mongodb');
const User = db.user;
const Role = db.role;


class UnitOfWork {
    constructor() {
        this.db = db;
        this.users = new UserRepository(User);
        this.roles = new RoleRepository(Role);
    }

    async complete() {
        await this.db.mongoose.connection.close();
    }
}

module.exports = UnitOfWork;