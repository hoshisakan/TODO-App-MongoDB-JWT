const { logInfo, logError } = require('../utils/log.util');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util');
const { getFilterQuery } = require('../utils/logic.check.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();

class TodoCategoryService extends BaseService {
    constructor() {
        super(unitOfWork.todoCategories);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'TodoCategory';
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

    create = async (todoCategory) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        logInfo(`${fileDetails} [todoCategory: ${stringify(todoCategory)}]`);
        validateFieldsAuthenticity(todoCategory);
        const todoCategoryCreated = await this.unitOfWork.todoCategories.create(todoCategory);
        logInfo(`${fileDetails} [todoCategoryCreated: ${stringify(todoCategoryCreated)}]`);
        return todoCategoryCreated;
    };

    ///TODO: Find one todo category by query parameters
    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todoCategories.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todoCategories.findOne(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all todo category by query parameters
    find = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todoCategories.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todoCategories.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoCategoryService;
