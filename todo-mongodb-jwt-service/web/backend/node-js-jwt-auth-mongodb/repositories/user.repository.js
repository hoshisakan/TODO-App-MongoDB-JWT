const { stringify } = require('../utils/json.util');
const { logInfo, logError } = require('../utils/log.util');
const { filenameFilter } = require('../utils/regex.util');

const Repository = require('./repository');

class UserRepository extends Repository {
    constructor(model) {
        super(model);
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    find = async (expression = {}) => {
        return await this.model.find(expression).populate('roles', 'name level');
    };

    findOne = async (expression = {}) => {
        return await this.model.findOne(expression).populate('roles', 'name level');
    };

    findById = async (id, fields = {}) => {
        return await this.model.findById(id).populate('roles', 'name level').select(fields);
    };

    addRoles = async (userId, roleIds) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const fields = { _id: 1, username: 1, email: 1, roles: 1 };
            const user = await this.model.findById(userId).select(fields);
            // logInfo(`addRoles: ${stringify(user)}`, fileDetails, true);

            if (!user) {
                throw new Error('User Not Found');
            }

            user.roles = roleIds;
            return await user.save();
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

    addRole = async (userId, roleId) => {
        const fields = { _id: 1, username: 1, email: 1, roles: 1 };
        const user = await this.model.findById(userId).select(fields);

        if (!user) {
            throw new Error('User Not Found');
        }

        user.roles = [roleId];

        return await user.save();
    };
}

module.exports = UserRepository;
