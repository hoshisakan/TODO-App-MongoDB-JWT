const Repository = require('./repository');


class UserRepository extends Repository {
    constructor(model) {
        super(model);
    }

    addRoles = async (userId, roleId) => {
        const user = await this.model.findById(userId);

        if (!user) {
            throw new Error('User Not Found');
        }

        ///TODO: push array to user.roles
        user.roles.push(roleId);

        return await user.save();
    }

    addRole = async (userId, roleId) => {
        const user = await this.model.findById(userId);

        if (!user) {
            throw new Error('User Not Found');
        }

        user.roles = [roleId];

        return await user.save();
    }
}

module.exports = UserRepository;