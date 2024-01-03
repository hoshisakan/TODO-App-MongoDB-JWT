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

    getTodoCategoryIdByValue = async (todoCategoryValues) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let todoCategoryIds = [];
        try {
            if (!todoCategoryValues) {
                throw new Error('Invalid todo category value');
            }

            let todoCategoryFound = null;

            if (!Array.isArray(todoCategoryValues) || todoCategoryValues.length === 0) {
                todoCategoryFound = (await this.unitOfWork.todoCategories.findOne({ value: todoCategoryValues })) || {};
                todoCategoryIds.push(todoCategoryFound._id);
            } else {
                todoCategoryFound =
                    (await this.unitOfWork.todoCategories.find({ value: { $in: todoCategoryValues } })) || {};
                todoCategoryIds = todoCategoryFound.map((todoCategory) => todoCategory._id);
            }
            // logInfo(`getTodoCategoryIdByValue: ${stringify(todoCategoryFound)}`, fileDetails, true);
        } catch (error) {
            logError(error, fileDetails, true);
            // throw error;
        }
        return todoCategoryIds;
    };

    getTodoCategoryItemsByValue = async (todoCategoryValues) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let todoCategoryItems = null;
        try {
            if (!todoCategoryValues) {
                throw new Error('Invalid todo category value');
            }

            if (!Array.isArray(todoCategoryValues) || todoCategoryValues.length === 0) {
                todoCategoryItems = (await this.unitOfWork.todoCategories.findOne({ value: todoCategoryValues })) || {};
            } else {
                todoCategoryItems =
                    (await this.unitOfWork.todoCategories.find({ value: { $in: todoCategoryValues } })) || {};
            }
            // logInfo(`getTodoCategoryIdByValue: ${stringify(todoCategoryItems)}`, fileDetails, true);
        } catch (error) {
            logError(error, fileDetails, true);
            // throw error;
        }
        return todoCategoryItems;
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

            if (!validateResult.isValid || validateResult.error) {
                throw new Error(validateResult.error);
            }

            const duplicateCheckEntity = { title: entity.title };

            logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

            ///TODO: Step 2: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName, 'create');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step 3: Check duplicate existing by query, if found throw error
            const todoFound = await this.unitOfWork.todos.findOne(duplicateExistingQuery);

            logInfo(`todoFound: ${stringify(todoFound)}`, fileDetails, true);

            if (Object.keys(todoFound).length > 0) {
                throw new Error('Todo already exists');
            }

            ///TODO: Step 4: Create todo category for specific user, if not found throw error
            const todoCategoryId = await this.getTodoCategoryIdByValue(entity.todoCategoryId);

            if (!todoCategoryId || todoCategoryId.length === 0) {
                throw new Error('Invalid todo category value');
            }

            ///TODO: Step 4.1: Add todo category id to entity and remove todo category value
            delete entity.category;
            entity.category = todoCategoryId[0];
            entity.user = userId;

            logInfo(
                `Entity of todo create: ${stringify(entity)}\nuserId: ${userId}: ${todoCategoryId}`,
                fileDetails,
                true
            );

            ///TODO: Step 5: Create todo for specific user with todo category, if not found throw error
            // const todoCreated = await this.unitOfWork.todos.addTodoCategoryAndUser(entity, userId);
            const todoCreated = await this.unitOfWork.todos.create(entity);

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
    bulkCreate = async (entities, userId) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entities) {
                throw new Error('Invalid entity');
            }

            if (!userId) {
                throw new Error('Invalid user id, please login again');
            }

            ///TODO: Step1: Validate entity params
            const validateResult = validateEntitiesParams(entities, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step2: Get duplicate existing query
            const duplicateCheckEntities = entities.map((entity) => {
                return { title: entity.title };
            });

            logInfo(`duplicateCheckEntities: ${stringify(duplicateCheckEntities)}`, fileDetails, true);

            const duplicateExistingQuery = await checkMultipleDuplicateExisting(
                duplicateCheckEntities,
                this.modelName,
                'create'
            );

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step3: Check duplicate existing by query, if found throw error
            const todoFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

            logInfo(`todoFound: ${stringify(todoFound)}`, fileDetails, true);

            if (Object.keys(todoFound).length > 0) {
                throw new Error('Todo already exists');
            }

            ///TODO: Step4: Get todo category ids by value
            const todoCategoryItems = await this.getTodoCategoryItemsByValue(
                entities.map((entity) => entity.todoCategoryId)
            );

            if (!todoCategoryItems || todoCategoryItems.length === 0) {
                throw new Error('Invalid todo category value');
            }

            ///TODO: Step5: Add todo category ids to entities
            entities.map((entity) => {
                const todoCategoryItem = todoCategoryItems.find(
                    (todoCategoryItem) => todoCategoryItem.value.toString() === entity.todoCategoryId
                );
                if (todoCategoryItem) {
                    logInfo(`match`, fileDetails, true);
                    delete entity.todoCategoryId;
                    entity.category = todoCategoryItem._id;
                    entity.user = userId;
                }
            });

            logInfo(`Entities of todo bulk create: ${stringify(entities)}`, fileDetails, true);

            ///TODO: Step6: Bulk create todos for specific user with todo category, if not found throw error
            const todoCreated = await this.unitOfWork.todos.createMany(entities);

            if (!todoCreated) {
                throw new Error('Todo category bulk creation failed');
            }
            logInfo(`todoCreated: ${stringify(todoCreated)}`, fileDetails, true);

            return todoCreated;
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

            ///TODO: Step2: Check duplicate existing by query, if found throw error
            const duplicateCheckEntity = { title: entity.title };

            logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

            if (!duplicateCheckEntity || Object.keys(duplicateCheckEntity).length === 0) {
                throw new Error('Invalid duplicate check entity');
            }

            ///TODO: Step2.1: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName, 'update');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step2.2: Check duplicate existing by query, if found throw error
            const duplicateItemsFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

            logInfo(`duplicateItemsFound: ${stringify(duplicateItemsFound)}`, fileDetails, true);

            if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                const duplicateItems = duplicateItemsFound.filter(
                    (item) => item._id.toString() !== id.toString() && item.title.toString() === entity.title.toString()
                );

                if (duplicateItems && duplicateItems.length > 0) {
                    throw new Error('Todo already exists, please try with different title');
                }
                logInfo(`duplicateItems: ${stringify(duplicateItems)}`, fileDetails, true);
            }

            ///TODO: Step3: Get update query
            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            ///TODO: Step2.1: Add updatedAt field to update query for record updated time
            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: id };

            ///TODO: option add new attribute for return modified document instead of original
            ///TODO: Step4: Update todo by id for one field, if not found throw error
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
            const todoFound = await this.unitOfWork.todos.findById(id);

            if (!todoFound) {
                throw new Error('Todo not found with the provided id');
            }

            ///TODO: Step3: Check duplicate existing by query, if found throw error
            const duplicateCheckEntity = { title: entity.title };

            logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

            ///TODO: Step3.1: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName, 'update');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            ///TODO: Step3.2: Check duplicate existing by query, if found throw error
            const duplicateItemsFound = await this.unitOfWork.todos.findOne(duplicateExistingQuery);

            logInfo(`duplicateItemsFound: ${stringify(duplicateItemsFound)}`, fileDetails, true);

            ///TODO: Step3.3: Check duplicate existing by query, if found throw error
            if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                ///TODO: Step3.4: Filter duplicate items by id and title, if found different id and same title throw error
                const duplicateItems = duplicateItemsFound.filter(
                    (item) =>
                        item._id.toString() !== todoFound._id.toString() &&
                        item.title.toString() === entity.title.toString()
                );

                if (duplicateItems && duplicateItems.length > 0) {
                    throw new Error('Todo already exists, please try with different title');
                }
                logInfo(`duplicateItems: ${stringify(duplicateItems)}`, fileDetails, true);
            }

            ///TODO: Step4: Get update query with updatedAt field
            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            ///TODO: Step4.1: If todo category value exist, get todo category id by value
            if (updateQuery.category) {
                ///TODO: Step4.1.1: Get todo category id by value
                const todoCategoryId = await this.getTodoCategoryIdByValue(entity.category);

                if (!todoCategoryId || todoCategoryId.length === 0) {
                    throw new Error('Invalid todo category value');
                }
                ///TODO: Step4.1.2: Add todo category id to entity and remove todo category value
                delete updateQuery.category;
                updateQuery.category = todoCategoryId[0];
            }
            updateQuery.updatedAt = Date.now();

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            ///TODO: Step4.2: Add todo id as update query condition
            const filterCondition = { _id: entity._id };

            ///TODO: Step5: Update todo by id for equal or more than one field, if not found throw error
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

    deleteAll = async () => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const deleteResult = await this.unitOfWork.todos.deleteMany({});
            if (!deleteResult) {
                throw new Error('Todo category deletion failed');
            }
            return deleteResult;
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
                throw new Error('Todo not found with the provided id');
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
