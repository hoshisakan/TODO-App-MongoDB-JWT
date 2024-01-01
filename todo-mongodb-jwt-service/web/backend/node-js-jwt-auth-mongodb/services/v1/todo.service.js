const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const {
    getFilterQuery,
    validateEntityParams,
    validateEntitiesParams,
    checkDuplicateExisting,
    checkMultipleDuplicateExisting,
    setOneAndUpdateFields,
} = require('../../utils/logic.check.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../../repositories/unitwork');
const unitOfWork = new UnitOfWork();

class TodoService extends BaseService {
    constructor() {
        super(unitOfWork.todos);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'Todo';
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

    create = async (entity) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entity) {
                throw new Error('Invalid entity');
            }

            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName);

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const todoCategoryFound = await this.unitOfWork.todos.findOne(duplicateExistingQuery);

            if (todoCategoryFound) {
                throw new Error('Todo category already exists');
            }

            logInfo(`todoCategoryFound: ${stringify(todoCategoryFound)}`, fileDetails, true);

            const todoCategoryCreated = await this.unitOfWork.todos.create(entity);

            if (!todoCategoryCreated) {
                throw new Error('Todo category creation failed');
            }
            return todoCategoryCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Bulk create todo category
    bulkCreate = async (entities) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entities) {
                throw new Error('Invalid entity');
            }

            const validateResult = validateEntitiesParams(entities, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            const duplicateExistingQuery = await checkMultipleDuplicateExisting(entities, this.modelName);

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const todoCategoryFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (todoCategoryFound && todoCategoryFound.length > 0) {
                throw new Error('Todo category already exists');
            }

            logInfo(`todoCategoryFound: ${stringify(todoCategoryFound)}`, fileDetails, true);

            const todoCategoryCreated = await this.unitOfWork.todos.createMany(entities);

            if (!todoCategoryCreated) {
                throw new Error('Todo category creation failed');
            }
            return todoCategoryCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    patchUpdateById = async (id, entity) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id || !entity) {
                throw new Error('Invalid parameters');
            }

            if (entity._id !== id) {
                throw new Error('Invalid parameters, id not match');
            }

            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            const updateQuery = setOneAndUpdateFields(entity, this.modelName);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: id };

            ///TODO: option add new attribute for return modified document instead of original
            const todoCategoryUpdated = await this.unitOfWork.todos.findOneAndUpdate(filterCondition, updateQuery);

            if (!todoCategoryUpdated) {
                throw new Error('Todo category update failed');
            }
            return todoCategoryUpdated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    updateById = async (id, entity) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id || !entity) {
                throw new Error('Invalid parameters');
            }

            if (entity._id !== id) {
                throw new Error('Invalid parameters, id not match');
            }

            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            const updateQuery = setOneAndUpdateFields(entity);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: entity._id };

            const todoCategoryUpdated = await this.unitOfWork.todos.updateOne(filterCondition, updateQuery);

            if (!todoCategoryUpdated) {
                throw new Error('Todo category update failed');
            }
            return todoCategoryUpdated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    deleteById = async (id) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id) {
                throw new Error('Invalid id');
            }

            const todoCategoryFound = await this.unitOfWork.todos.findById(id);

            if (!todoCategoryFound) {
                throw new Error('Todo category not found with the provided id');
            }

            const todoCategoryDeleted = await this.unitOfWork.todos.deleteOne({ _id: id });

            if (!todoCategoryDeleted) {
                throw new Error('Todo category deletion failed');
            }

            return todoCategoryDeleted;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find one todo category by query parameters
    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todos.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todos.findOne(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findById = async (id) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!id) {
                throw new Error('Invalid id');
            }
            const searchResult = await this.unitOfWork.todos.findById(id);

            if (!searchResult) {
                throw new Error('Todo category not found with the provided id');
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
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
                searchResult = await this.unitOfWork.todos.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todos.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoService;
