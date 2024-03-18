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

    find = async (
        expression = {},
        fields = {},
        userFKFields = { username: 1, email: 1 },
        categoryFKFields = { name: 1, value: 1 },
        statusFKFields = { name: 1, value: 1 },
        sortFields = { createdAt: -1 }
        // sortFields = { createdAt: -1, updatedAt: 1 }
    ) => {
        return await this.model
            .find(expression)
            .populate('user', userFKFields)
            .populate('category', categoryFKFields)
            .populate('status', statusFKFields)
            .select(fields)
            .sort(sortFields);
    };

    findOne = async (
        expression = {},
        fields = {},
        userFKFields = { username: 1, email: 1 },
        categoryFKFields = { name: 1, value: 1 },
        statusFKFields = { name: 1, value: 1 }
    ) => {
        return await this.model
            .findOne(expression)
            .populate('user', userFKFields)
            .populate('category', categoryFKFields)
            .populate('status', statusFKFields)
            .select(fields);
    };

    findById = async (
        id,
        fields = {},
        userFKFields = { username: 1, email: 1, _id: 0 },
        categoryFKFields = { name: 1, value: 1, category: 0 },
        statusFKFields = { name: 1, value: 1 }
    ) => {
        return await this.model
            .findById(id)
            .populate('user', userFKFields)
            .populate('category', categoryFKFields)
            .populate('status', statusFKFields)
            .select(fields);
    };

    addTodoItems = async (entity, userId) => {
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
                status: entity.todoStatusId,
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
