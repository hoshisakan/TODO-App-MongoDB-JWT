const { logInfo, logError } = require('../utils/log.util');
const { filenameFilter } = require('../utils/regex.util');

const Repository = require('./repository');

class TodoCategoryRepository extends Repository {
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
}

module.exports = TodoCategoryRepository;
