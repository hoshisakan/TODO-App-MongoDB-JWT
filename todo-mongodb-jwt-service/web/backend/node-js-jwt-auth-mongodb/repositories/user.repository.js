const { log } = require('winston');
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

    addRoles = async (userId, roleIds) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const user = await this.model.findById(userId);

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
        const user = await this.model.findById(userId);

        if (!user) {
            throw new Error('User Not Found');
        }

        user.roles = [roleId];

        return await user.save();
    };
}

module.exports = UserRepository;
