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

    getArrayUniqueItem = async (valueArr) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isDuplicate: false,
            arrayUniqueValues: [],
        };

        try {
            if (!Array.isArray(valueArr) || valueArr.length === 0) {
                throw new Error('Invalid value');
            }

            const isDupicateResult = valueArr.some((currVal, index) => valueArr.indexOf(currVal) !== index);

            if (isDupicateResult) {
                result.isDuplicate = true;
                result.arrayUniqueValues = [...new Set(valueArr)];
            } else {
                result.isDuplicate = false;
                result.arrayUniqueValues = valueArr;
            }
        } catch (error) {
            logError(error, fileDetails, true);
            result = {
                isDuplicate: false,
                arrayUniqueValues: [],
            };
        }
        return result;
    };

    ///TODO: Get todo category ids by values array
    getIdsByValue = async (todoCategoryValues) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let ids = [];
        try {
            if (!todoCategoryValues) {
                throw new Error('Invalid todo category value');
            }

            if (!Array.isArray(todoCategoryValues) || todoCategoryValues.length === 0) {
                ids = (await this.unitOfWork.todoCategories.findOne({ value: todoCategoryValues }))._id;
            } else {
                const getArrayUniqueItemResult = await this.getArrayUniqueItem(todoCategoryValues);
                logInfo(`getArrayUniqueItemResult: ${stringify(getArrayUniqueItemResult)}`, fileDetails, true);

                if (
                    !getArrayUniqueItemResult &&
                    (!getArrayUniqueItemResult.arrayUniqueValues ||
                        getArrayUniqueItemResult.arrayUniqueValues.length === 0)
                ) {
                    throw new Error('Invalid todo category value');
                }

                if (!getArrayUniqueItemResult.isDuplicate && getArrayUniqueItemResult.arrayUniqueValues.length > 0) {
                    const todoCategoryItems = await this.unitOfWork.todoCategories.find({
                        value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                    });
                    ids = todoCategoryItems.map((todoCategoryItem) => todoCategoryItem._id);
                } else if (
                    getArrayUniqueItemResult.isDuplicate &&
                    getArrayUniqueItemResult.arrayUniqueValues.length > 0
                ) {
                    const todoCategoryItems = await this.unitOfWork.todoCategories.find(
                        {
                            value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                        },
                        { value: 1 }
                    );

                    todoCategoryValues.forEach((value) => {
                        todoCategoryItems.filter((items) => {
                            if (items.value.toString() === value.toString()) {
                                ids.push(items._id);
                            }
                        });
                    });
                }
            }
        } catch (error) {
            logError(error, fileDetails, true);
        }
        return ids;
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

            const searchIdResult = await this.getIdsByValue(entity.todoCategoryId);

            if (!searchIdResult || searchIdResult.length == 0) {
                throw new Error(`Invalid todoCategoryId: ${entity.todoCategoryId}`);
            }

            logInfo(`searchIdResult: ${searchIdResult}`, fileDetails, true);

            entity.category = searchIdResult;
            entity.user = userId;
            delete entity.todoCategoryId;

            logInfo(`Entity of todo create: ${stringify(entity)}`, fileDetails);

            const createResult = await this.unitOfWork.todos.create(entity);

            if (!createResult) {
                throw new Error('Todo category creation failed');
            }
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
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

            const checkBodyDuplicateItems = entities.map((entity) => entity.title);

            const checkDuplicateItemExistsResult = await this.getArrayUniqueItem(checkBodyDuplicateItems);

            if (checkDuplicateItemExistsResult.isDuplicate) {
                throw new Error('Is duplicate exists in items');
            }

            const checkDatabaseDuplicateItems = entities.map((entity) => {
                return {
                    title: entity.title,
                };
            });

            // TODO: Step 2: Get duplicate existing query, if not found throw error
            const duplicateExistingQuery = await checkMultipleDuplicateExisting(
                checkDatabaseDuplicateItems,
                this.modelName,
                'create'
            );

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step 3: Check duplicate existing by query, if found, throw error
            const duplicateExistingResult = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (duplicateExistingResult && duplicateExistingResult.length > 0) {
                throw new Error('Todo already exists');
            }
            logInfo(`duplicateExistingResult: ${stringify(duplicateExistingResult)}`, fileDetails, true);

            //TODO: Step 3: Get todo category name from todo category id
            const todoCategoryNames = await entities.map((entity) => entity.todoCategoryId);

            const searchIdResult = await this.getIdsByValue(todoCategoryNames);

            if (!searchIdResult || searchIdResult.length === 0) {
                throw new Error('Invalid todo value');
            }

            if (searchIdResult.length !== todoCategoryNames.length) {
                throw new Error(`Two items do not match.`);
            }

            logInfo(`searchIdResult: ${stringify(searchIdResult)}`, fileDetails, true);

            entities.forEach((entity, index) => {
                entity.category = searchIdResult[index];
                entity.user = userId;
                delete entity.todoCategoryId;
            });

            const createResult = await this.unitOfWork.todos.insertMany(entities);

            if (!createResult) {
                throw new Error('Todo category bulk creation failed');
            }

            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
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

            const searchResult = await this.unitOfWork.todos.findById(id);

            if (!searchResult) {
                throw new Error('Todo not found with the provided id');
            }

            if (entity.title) {
                const duplicateCheckEntity = {
                    _id: id,
                    title: entity.title,
                };

                logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

                ///TODO: Step4.2: Get duplicate existing query
                const duplicateExistingQuery = await checkDuplicateExisting(
                    duplicateCheckEntity,
                    this.modelName,
                    'update'
                );

                logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

                if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                    throw new Error('Invalid duplicate existing query');
                }

                logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

                const duplicateExistingResult = await this.unitOfWork.todos.find(duplicateExistingQuery);

                if (duplicateExistingResult && duplicateExistingResult.length > 0) {
                    throw new Error('Todo already exists, please try with different title');
                }

                const duplicateItemsFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

                if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                    throw new Error('Todo already exists, please try with different title');
                }
            }

            if (entity.todoCategoryId) {
                const todoCategoryId = await this.getIdsByValue(entity.todoCategoryId);
                delete entity.todoCategoryId;
                entity.category = todoCategoryId;
            }

            const filterCondition = {
                _id: id,
            };

            entity.updatedAt = new Date();

            const updateResult = await this.unitOfWork.todos.findOneAndUpdate(filterCondition, entity);

            if (!updateResult) {
                throw new Error('Update todo item failed');
            }
            return updateResult;
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

            const searchResult = await this.unitOfWork.todos.findById(id);

            if (!searchResult) {
                throw new Error('Todo not found with the provided id');
            }

            ///TODO: Step3: Check duplicate existing by query, if found throw error
            const duplicateCheckEntity = {
                _id: id,
                title: entity.title,
            };

            logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

            ///TODO: Step3.1: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName, 'update');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            const duplicateExistingResult = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (duplicateExistingResult && duplicateExistingResult.length > 0) {
                throw new Error('Todo has been exists, please try with different title');
            }

            const duplicateItemsFound = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                throw new Error('Todo has been exists, please try with different title');
            }

            if (entity.todoCategoryId) {
                const todoCategoryId = await this.getIdsByValue(entity.todoCategoryId);

                if (!todoCategoryId || todoCategoryId.length === 0) {
                    throw new Error('Invalid todo category value');
                }
                delete entity.todoCategoryId;
                entity.category = todoCategoryId;
            }

            entity.updatedAt = Date.now();

            ///TODO: Step4.2: Add todo id as update query condition
            const filterCondition = { _id: id };

            ///TODO: Step5: Update todo by id for equal or more than one field, if not found throw error
            const updateResult = await this.unitOfWork.todos.findOneAndReplace(filterCondition, entity);

            if (!updateResult) {
                throw new Error('Update todo item failed');
            }
            return updateResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Delete todo by id
    deleteById = async (id) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id) {
                throw new Error('Invalid id');
            }

            ///TODO: Step1: Find todo by id, if not found throw error
            const searchResult = await this.unitOfWork.todos.findById(id);

            if (!searchResult) {
                throw new Error(`Todo with id ${id} not found`);
            }

            ///TODO: Step2: Delete todo by id, if not found throw error
            const deleteResult = await this.unitOfWork.todos.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete todo failed');
            }
            return deleteResult;
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
                throw new Error(`Todo with id ${id} not found`);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all todo category by query parameters
    findAll = async (queryParams) => {
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
