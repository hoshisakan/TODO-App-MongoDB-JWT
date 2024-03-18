const { logInfo, logError } = require('../utils/log.util');
const { filenameFilter } = require('../utils/regex.util');

const Repository = require('./repository');

class ProfileRepository extends Repository {
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

    find = async (expression = {}, fields = {}, userFKFields = { username: 1, email: 1, _id: 0 }, sortFields) => {
        return await this.model.find(expression).populate('user', userFKFields).select(fields).sort(sortFields);
    };

    findOne = async (expression = {}, fields = {}, userFKFields = { username: 1, email: 1, _id: 0 }) => {
        return await this.model.findOne(expression).populate('user', userFKFields).select(fields);
    };

    findById = async (id, fields = {}, userFKFields = { username: 1, email: 1, _id: 0 }) => {
        return await this.model.findById(id).populate('user', userFKFields).select(fields);
    };
}

module.exports = ProfileRepository;
