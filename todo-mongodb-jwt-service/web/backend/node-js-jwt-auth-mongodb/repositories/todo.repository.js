const { logInfo, logError } = require('../utils/log.util');
const { filenameFilter } = require('../utils/regex.util');

const Repository = require('./repository');

class TodoRepository extends Repository {
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
        return await this.model
            .find(expression)
            .populate('user', 'username email -_id')
            .populate('category', 'name value');
    };

    findOne = async (expression = {}) => {
        return await this.model
            .find(expression)
            .populate('user', 'username email -_id')
            .populate('category', 'name value');
    };

    findById = async (id) => {
        return await this.model.findById(id).populate('user', 'username email -_id').populate('category', 'name value');
    };

    addTodoCategoryAndUser = async (entity, userId) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entity) {
                throw new Error('Entity Not Found');
            }

            const Todo = new this.model({
                title: entity.title,
                description: entity.description,
                status: entity.status,
                priority: entity.priority,
                isCompleted: entity.isCompleted,
                type: entity.type,
                startDate: entity.startDate,
                dueDate: entity.dueDate,
                category: entity.todoCategoryId,
                user: userId,
            });

            return await Todo.save();
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };
}

module.exports = TodoRepository;
