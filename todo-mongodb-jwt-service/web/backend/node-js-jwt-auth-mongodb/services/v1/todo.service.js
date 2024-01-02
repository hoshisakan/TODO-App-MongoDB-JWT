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
const { log } = require('winston');
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

    getCurrentLoggedInUserId = async (user) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!user) {
                throw new Error('Invalid user');
            }

            if (!user.username || !user.email) {
                throw new Error('Invalid user details');
            }

            const userFound = await this.unitOfWork.users.findOne({ username: user.username, email: user.email });

            if (!userFound) {
                throw new Error('User not found');
            }
            return userFound._id;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    getTodoCategoryIdByValue = async (todoCategoryValue) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let todoCategoryFound = {};
        try {
            if (!todoCategoryValue) {
                throw new Error('Invalid todo category value');
            }

            const todoCategoryFound = await this.unitOfWork.todoCategories.findOne({ value: todoCategoryValue });

            if (!todoCategoryFound) {
                throw new Error('Todo category not found');
            }
            return todoCategoryFound._id;
        } catch (error) {
            logError(error, fileDetails, true);
            // throw error;
        }
        return todoCategoryFound;
    };

    ///TODO: Create todo for specific user
    create = async (entity, userId) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entity) {
                throw new Error('Invalid entity');
            }

            if (!userId) {
                throw new Error('Invalid user id, please login again');
            }

            ///TODO: Step 1: Validate entity params
            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            const duplicateCheckEntity = { title: entity.title };

            logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

            ///TODO: Step 2: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName);

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step 3: Check duplicate existing by query, if found throw error
            const todoFound = await this.unitOfWork.todos.findOne(duplicateExistingQuery);

            if (todoFound) {
                throw new Error('Todo already exists');
            }

            logInfo(`todoFound: ${stringify(todoFound)}`, fileDetails, true);

            ///TODO: Step 4: Create todo category for specific user, if not found throw error
            const todoCategoryFound = await this.getTodoCategoryIdByValue(entity.category);

            if (!todoCategoryFound) {
                throw new Error('Invalid todo category value');
            }

            const todoCategoryId = todoCategoryFound._id;

            if (!todoCategoryId) {
                throw new Error('Invalid todo category id');
            }

            logInfo(`todoCategoryId: ${stringify(todoCategoryId)}`, fileDetails, true);

            entity.todoCategoryId = todoCategoryId;

            logInfo(`Entity of todo create: ${stringify(entity)}\nuserId: ${userId}: ${todoCategoryId}`, fileDetails, true);

            ///TODO: Step 5: Create todo for specific user with todo category, if not found throw error
            const todoCreated = await this.unitOfWork.todos.addTodoCategoryAndUser(entity, userId);

            if (!todoCreated) {
                throw new Error('Todo category creation failed');
            }

            logInfo(`todoCreated: ${stringify(todoCreated)}`, fileDetails, true);

            return todoCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Bulk create todos for specific user
    bulkCreate = async (entities) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entities) {
                throw new Error('Invalid entity');
            }

            ///TODO: Step1: Validate entity params
            const validateResult = validateEntitiesParams(entities, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step2: Get duplicate existing query
            const duplicateExistingQuery = await checkMultipleDuplicateExisting(entities, this.modelName);

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step3: Check duplicate existing by query, if found throw error
            const todoFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (todoFound && todoFound.length > 0) {
                throw new Error('Todo already exists');
            }

            logInfo(`todoFound: ${stringify(todoFound)}`, fileDetails, true);

            ///TODO: Step4: Create multiple todo for specific user
            const todCreated = await this.unitOfWork.todos.createMany(entities);

            if (!todCreated) {
                throw new Error('Todo category creation failed');
            }
            return todCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Update todo by id for one field
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

            ///TODO: Step1: Validate entity params
            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step2: Get update query
            const updateQuery = setOneAndUpdateFields(entity, this.modelName);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            ///TODO: Step2.1: Add updatedAt field to update query for record updated time
            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: id };

            ///TODO: option add new attribute for return modified document instead of original
            ///TODO: Step3: Update todo by id for one field, if not found throw error
            const todoUpdated = await this.unitOfWork.todos.findOneAndUpdate(filterCondition, updateQuery);

            if (!todoUpdated) {
                throw new Error('Todo update failed');
            }
            return todoUpdated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Update todo by id for equal or more than one field
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

            ///TODO: Step1: Validate entity params
            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step2: Get update query
            const updateQuery = setOneAndUpdateFields(entity);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            ///TODO: Step2.1: Add updatedAt field to update query for record updated time
            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: entity._id };

            ///TODO: Step3: Update todo by id for equal or more than one field, if not found throw error
            const todoUpdated = await this.unitOfWork.todos.updateOne(filterCondition, updateQuery);

            if (!todoUpdated) {
                throw new Error('Todo category update failed');
            }
            return todoUpdated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Delete todo by id
    deleteById = async (id) => {
        const classAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id) {
                throw new Error('Invalid id');
            }

            ///TODO: Step1: Find todo by id, if not found throw error
            const todoFound = await this.unitOfWork.todos.findById(id);

            if (!todoFound) {
                throw new Error('Todo not found with the provided id');
            }

            ///TODO: Step2: Delete todo by id, if not found throw error
            const todoDeleted = await this.unitOfWork.todos.deleteOne({ _id: id });

            if (!todoDeleted) {
                throw new Error('Todo deletion failed');
            }

            return todoDeleted;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find one todo by query parameters
    findOne = async (queryParams) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            ///TODO: Step1.1: If no query parameters, find one todo category
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todos.findOne({});
            }
            ///TODO: Step1.2: If query parameters, find one todo category by query parameters
            else {
                ///TODO: Step1.2.1: Get filter query, if not found throw error
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                ///TODO: Step1.2.2: Find one todo by query parameters, if not found throw error
                searchResult = await this.unitOfWork.todos.findOne(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find todo by id
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
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
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
