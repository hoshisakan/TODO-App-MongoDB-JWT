const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const {
    getFilterQuery,
    checkDuplicateExisting,
    checkMultipleDuplicateExisting,
} = require('../../utils/logic.check.util');
const { getSelectFields, getSelectFKFields, validObjectId, toObjectId } = require('../../utils/mongoose.filter.util');

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
    getIdsByCategoryValue = async (todoCategoryValues) => {
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

    ///TODO: Get todo status ids by values array
    getIdsByStatusValue = async (todoStatusValues) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let ids = [];
        try {
            if (!todoStatusValues) {
                throw new Error('Invalid todo status value');
            }

            if (!Array.isArray(todoStatusValues) || todoStatusValues.length === 0) {
                ids = (await this.unitOfWork.todoStatuses.findOne({ value: todoStatusValues }))._id;
            } else {
                const getArrayUniqueItemResult = await this.getArrayUniqueItem(todoStatusValues);
                logInfo(`getArrayUniqueItemResult: ${stringify(getArrayUniqueItemResult)}`, fileDetails, true);

                if (
                    !getArrayUniqueItemResult &&
                    (!getArrayUniqueItemResult.arrayUniqueValues ||
                        getArrayUniqueItemResult.arrayUniqueValues.length === 0)
                ) {
                    throw new Error('Invalid todo status value');
                }

                if (!getArrayUniqueItemResult.isDuplicate && getArrayUniqueItemResult.arrayUniqueValues.length > 0) {
                    const todoStatusItems = await this.unitOfWork.todoStatuses.find({
                        value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                    });
                    ids = todoStatusItems.map((todoStatusItem) => todoStatusItem._id);
                } else if (
                    getArrayUniqueItemResult.isDuplicate &&
                    getArrayUniqueItemResult.arrayUniqueValues.length > 0
                ) {
                    const todoStatusItems = await this.unitOfWork.todoStatuses.find(
                        {
                            value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                        },
                        { value: 1 }
                    );

                    todoStatusValues.forEach((value) => {
                        todoStatusItems.filter((items) => {
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

    ///TODO: Get todo category ids by names array
    getIdsByCategoryName = async (todoCategpryNames) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let ids = [];
        try {
            if (!todoCategpryNames) {
                throw new Error('Invalid todo status value');
            }

            if (!Array.isArray(todoCategpryNames) || todoCategpryNames.length === 0) {
                ids = (await this.unitOfWork.todoCategories.findOne({ name: todoCategpryNames }))._id;
            } else {
                const getArrayUniqueItemResult = await this.getArrayUniqueItem(todoCategpryNames);
                logInfo(`getArrayUniqueItemResult: ${stringify(getArrayUniqueItemResult)}`, fileDetails, true);

                if (
                    !getArrayUniqueItemResult &&
                    (!getArrayUniqueItemResult.arrayUniqueValues ||
                        getArrayUniqueItemResult.arrayUniqueValues.length === 0)
                ) {
                    throw new Error('Invalid todo status value');
                }

                if (!getArrayUniqueItemResult.isDuplicate && getArrayUniqueItemResult.arrayUniqueValues.length > 0) {
                    const todoCategoryItems = await this.unitOfWork.todoCategories.find({
                        value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                    });
                    ids = todoCategoryItems.map((todoStatusItem) => todoStatusItem._id);
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

                    todoCategpryNames.forEach((value) => {
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

    ///TODO: Get todo status ids by names array
    getIdsByStatusName = async (todoStatusNames) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let ids = [];
        try {
            if (!todoStatusNames) {
                throw new Error('Invalid todo status value');
            }

            if (!Array.isArray(todoStatusNames) || todoStatusNames.length === 0) {
                ids = (await this.unitOfWork.todoStatuses.findOne({ name: todoStatusNames }))._id;
            } else {
                const getArrayUniqueItemResult = await this.getArrayUniqueItem(todoStatusNames);
                logInfo(`getArrayUniqueItemResult: ${stringify(getArrayUniqueItemResult)}`, fileDetails, true);

                if (
                    !getArrayUniqueItemResult &&
                    (!getArrayUniqueItemResult.arrayUniqueValues ||
                        getArrayUniqueItemResult.arrayUniqueValues.length === 0)
                ) {
                    throw new Error('Invalid todo status value');
                }

                if (!getArrayUniqueItemResult.isDuplicate && getArrayUniqueItemResult.arrayUniqueValues.length > 0) {
                    const todoStatusItems = await this.unitOfWork.todoStatuses.find({
                        value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                    });
                    ids = todoStatusItems.map((todoStatusItem) => todoStatusItem._id);
                } else if (
                    getArrayUniqueItemResult.isDuplicate &&
                    getArrayUniqueItemResult.arrayUniqueValues.length > 0
                ) {
                    const todoStatusItems = await this.unitOfWork.todoStatuses.find(
                        {
                            value: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                        },
                        { value: 1 }
                    );

                    todoStatusNames.forEach((value) => {
                        todoStatusItems.filter((items) => {
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
    create = async (entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };

        try {
            if (!entity) {
                throw new Error('Invalid entity');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Invalid user id, please login again');
            }

            const searchCategoryIdResult = await this.getIdsByCategoryValue(entity.todoCategoryId);
            const searchStatusIdResult = await this.getIdsByStatusValue(entity.todoStatusId);

            if (!searchCategoryIdResult || searchCategoryIdResult.length == 0) {
                throw new Error(`Invalid todo category id: ${entity.todoCategoryId}`);
            }
            if (!searchStatusIdResult || searchStatusIdResult.length == 0) {
                throw new Error(`Invalid todo status id: ${entity.todoStatusId}`);
            }

            logInfo(`Search category id result: ${searchCategoryIdResult}`, fileDetails, true);
            logInfo(`Search status id result: ${searchStatusIdResult}`, fileDetails, true);

            entity.category = searchCategoryIdResult;
            entity.status = searchStatusIdResult;
            entity.user = tokenParseResult.userId;
            delete entity.todoCategoryId;
            delete entity.todoStatusId;

            logInfo(`Entity of todo create: ${stringify(entity)}`, fileDetails);

            const createResult = await this.unitOfWork.todos.create(entity);

            if (!createResult) {
                throw new Error('Todo create failed');
            }
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            result.isSuccess = true;
        } catch (error) {
            logError(error, fileDetails, true);
            result.message = error.message;
        }
        return result;
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

            const duplicateExistingQuery = await checkMultipleDuplicateExisting(
                checkDatabaseDuplicateItems,
                this.modelName,
                'create'
            );

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const duplicateExistingResult = await this.unitOfWork.todos.find(duplicateExistingQuery);

            if (duplicateExistingResult && duplicateExistingResult.length > 0) {
                throw new Error('Todo already exists');
            }
            logInfo(`duplicateExistingResult: ${stringify(duplicateExistingResult)}`, fileDetails, true);

            const todoCategoryNames = await entities.map((entity) => entity.todoCategoryId);
            const todoStatusNames = await entities.map((entity) => entity.todoStatusId);

            const searchCategoryIdResult = await this.getIdsByCategoryValue(todoCategoryNames);
            const searchStatusIdResult = await this.getIdsByStatusValue(todoStatusNames);

            if (!searchCategoryIdResult || searchCategoryIdResult.length === 0) {
                throw new Error('Invalid todo category value');
            }

            if (searchCategoryIdResult.length !== todoCategoryNames.length) {
                throw new Error(`Two todo category items do not match.`);
            }

            if (!searchStatusIdResult || searchStatusIdResult.length === 0) {
                throw new Error('Invalid todo status value');
            }

            if (searchStatusIdResult.length !== todoStatusNames.length) {
                throw new Error(`Two todo status items do not match.`);
            }

            logInfo(`Search category id result: ${stringify(searchCategoryIdResult)}`, fileDetails, true);
            logInfo(`Search status id result: ${stringify(searchStatusIdResult)}`, fileDetails, true);

            entities.forEach((entity, index) => {
                entity.category = searchCategoryIdResult[index];
                entity.status = searchStatusIdResult[index];
                entity.user = userId;
                delete entity.todoCategoryId;
                delete entity.todoStatusId;
            });

            const createResult = await this.unitOfWork.todos.insertMany(entities);

            if (!createResult) {
                throw new Error('Todo bulk create failed');
            }

            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Update todo by id for one field
    patchUpdateById = async (id, entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        const result = {
            isModifiedSuccess: false,
            message: '',
        };
        try {
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Unauthorized, Invaild user id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            const statusFKFields = FKFields['status'];

            const searchResult = await this.unitOfWork.todos.findById(
                id,
                selectFields,
                userFKFields,
                categoryFKFields,
                statusFKFields
            );

            if (!searchResult) {
                throw new Error('Todo not found with the provided id');
            }

            let isAllowedUpadte = false;

            let oldRecord = {};
            oldRecord = searchResult.toObject();
            delete oldRecord['category']['_id'];
            delete oldRecord['status']['_id'];
            oldRecord['category'] = searchResult['category']._id;
            oldRecord['status'] = searchResult['status']._id;

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
                oldRecord.title = entity.title;
            }

            if (entity.todoCategoryId) {
                const todoCategoryId = await this.getIdsByCategoryValue(entity.todoCategoryId);
                // delete entity.todoCategoryId;
                if (!todoCategoryId || todoCategoryId.length === 0) {
                    throw new Error('Invalid todo category value');
                }
                logInfo(`todoCategoryId: ${todoCategoryId}`, fileDetails);
                oldRecord.category = todoCategoryId;
                isAllowedUpadte = true;
            }

            if (entity.todoStatusId) {
                const todoStatusId = await this.getIdsByStatusValue(entity.todoStatusId);
                // delete entity.todoStatusId;
                if (!todoStatusId || todoStatusId.length === 0) {
                    throw new Error('Invalid todo status value');
                }
                logInfo(`todoStatusId: ${todoStatusId}`, fileDetails);
                oldRecord.status = todoStatusId;
                isAllowedUpadte = true;
            }

            if (entity.todoCategoryId) {
                const todoCategoryId = await this.getIdsByCategoryName(entity.todoCategoryId);
                // delete entity.todoCategoryId;
                if (!todoCategoryId || todoCategoryId.length === 0) {
                    throw new Error('Invalid todo category value');
                }
                logInfo(`todoCategoryId: ${todoCategoryId}`, fileDetails);
                oldRecord.category = todoCategoryId;
                isAllowedUpadte = true;
            }

            if (entity.status) {
                const todoStatusId = await this.getIdsByStatusName(entity.status);
                // delete entity.todoStatusId;
                if (!todoStatusId || todoStatusId.length === 0) {
                    throw new Error('Invalid todo status value');
                }
                logInfo(`todoStatusId: ${todoStatusId}`, fileDetails);
                oldRecord.status = todoStatusId;
                isAllowedUpadte = true;
            }

            if (entity.description) {
                oldRecord.description = entity.description;
                isAllowedUpadte = true;
            }

            if (entity.startDate) {
                oldRecord.startDate = entity.startDate;
                isAllowedUpadte = true;
            }

            if (entity.dueDate) {
                oldRecord.dueDate = entity.dueDate;
                isAllowedUpadte = true;
            }

            if (isAllowedUpadte) {
                oldRecord.user = tokenParseResult.userId;
                oldRecord.updatedAt = Date.now();
                const filterCondition = {
                    _id: id,
                };
                const updateResult = await this.unitOfWork.todos.findOneAndUpdate(filterCondition, oldRecord);

                if (!updateResult) {
                    throw new Error('Update todo item failed');
                }
            }
            result.isModifiedSuccess = true;
        } catch (error) {
            logError(error, fileDetails, true);
            result.message = error.message;
        }
        return result;
    };

    ///TODO: Update todo by id for equal or more than one field
    updateById = async (id, entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };
        try {
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Unauthorized, Invaild user id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            const statusFKFields = FKFields['status'];

            ///TODO: Remind if not add categoryFKField filter, will be get the following message:
            ///TODO: Cannot do exclusion on field category in inclusion projection
            const searchResult = await this.unitOfWork.todos.findById(
                id,
                selectFields,
                userFKFields,
                categoryFKFields,
                statusFKFields
            );

            if (!searchResult) {
                throw new Error('Todo not found with the provided id');
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();
            delete oldRecord['category']['_id'];
            oldRecord['category'] = searchResult['category']._id;
            delete oldRecord['status']['_id'];
            oldRecord['status'] = searchResult['status']._id;

            if (entity.title) {
                const duplicateCheckEntity = {
                    _id: id,
                    title: entity.title,
                };

                logInfo(`duplicateCheckEntity: ${stringify(duplicateCheckEntity)}`, fileDetails, true);

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
                    throw new Error('Todo has been exists, please try with different title');
                }

                const duplicateItemsFound = await this.unitOfWork.todos.find(
                    duplicateExistingQuery,
                    selectFields,
                    userFKFields,
                    categoryFKFields,
                    statusFKFields
                );

                if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                    throw new Error('Todo has been exists, please try with different title');
                }
                oldRecord.title = entity.title;
            }

            if (entity.todoCategoryId) {
                const todoCategoryId = await this.getIdsByCategoryValue(entity.todoCategoryId);

                if (!todoCategoryId || todoCategoryId.length === 0) {
                    throw new Error('Invalid todo category value');
                }
                // delete entity.todoCategoryId;
                oldRecord.category = todoCategoryId;
            }

            if (entity.todoStatusId) {
                const todoStatusId = await this.getIdsByStatusValue(entity.todoStatusId);

                if (!todoStatusId || todoStatusId.length === 0) {
                    throw new Error('Invalid todo status value');
                }
                // delete entity.todoStatusId;
                oldRecord.status = todoStatusId;
            }

            if (entity.description) {
                oldRecord.description = entity.description;
            }

            if (entity.status) {
                oldRecord.status = entity.status;
            }

            if (entity.startDate) {
                oldRecord.startDate = entity.startDate;
            }

            if (entity.dueDate) {
                oldRecord.dueDate = entity.dueDate;
            }

            oldRecord.user = tokenParseResult.userId;
            oldRecord.updatedAt = Date.now();

            const filterCondition = { _id: id };
            const updateResult = await this.unitOfWork.todos.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update todo item failed');
            }
            result.isSuccess = true;
        } catch (err) {
            // logError(error, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Delete todo by id
    deleteById = async (id) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };
        try {
            if (!id || !validObjectId(id)) {
                throw new Error('Invalid id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            ///TODO: Step1: Find todo by id, if not found throw error
            const searchResult = await this.unitOfWork.todos.findById(id, selectFields, userFKFields, categoryFKFields);

            if (!searchResult) {
                throw new Error(`Todo with id ${id} not found`);
            }

            ///TODO: Step2: Delete todo by id, if not found throw error
            const deleteResult = await this.unitOfWork.todos.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete todo failed');
            }
            logInfo(`Remove result: ${deleteResult}`, fileDetails);
            result.isSuccess = true;
        } catch (err) {
            // logError(error, fileDetails, true);
            result.message = err.message;
        }
        return result;
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
    findOne = async (queryParams, tokenParseResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = {};

        try {
            if (!tokenParseResult || !tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            const statusFKFields = FKFields['status'];

            let tempSearchResult = {};

            ///TODO: Step1.1: If no query parameters, find one todo category
            if (!queryParams || Object.keys(queryParams).length === 0) {
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.todos.findOne(
                        {},
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                } else {
                    tempSearchResult = await this.unitOfWork.todos.findOne(
                        {
                            user: toObjectId(tokenParseResult.userId),
                        },
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                }
            }
            ///TODO: Step1.2: If query parameters, find one todo category by query parameters
            else {
                ///TODO: Step1.2.1: Get filter query, if not found throw error
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);
                logInfo(`filterQueryResult: ${stringify(filterQueryResult)}`, fileDetails);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    ///TODO: Step1.2.2: Find one todo by query parameters, if not found throw error
                    tempSearchResult = await this.unitOfWork.todos.findOne(
                        filterQueryResult.query,
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                } else {
                    const limitFilterQueryResult = {
                        $and: [
                            filterQueryResult.query,
                            {
                                user: toObjectId(tokenParseResult.userId),
                            },
                        ],
                    };
                    logInfo(`limitFilterQueryResult: ${stringify(limitFilterQueryResult)}`, fileDetails);
                    ///TODO: Step1.2.2: Find one todo by query parameters, if not found throw error
                    tempSearchResult = await this.unitOfWork.todos.findOne(
                        limitFilterQueryResult,
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                }
            }
            if (!tempSearchResult) {
                throw new Error('Not found any record');
            }
            searchResult = tempSearchResult.toObject();
            searchResult['user'] = tempSearchResult['user']['_id'];
            searchResult['category'] = tempSearchResult['category']['name'];
            searchResult['status'] = tempSearchResult['status']['name'];
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
            if (!id || !validObjectId(id)) {
                throw new Error('Invalid id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            const statusFKFields = FKFields['status'];

            const tempSearchResult = await this.unitOfWork.todos.findById(
                id,
                selectFields,
                userFKFields,
                categoryFKFields,
                statusFKFields
            );

            if (!tempSearchResult) {
                throw new Error(`Todo with id ${id} not found`);
            }

            const searchResult = tempSearchResult.toObject();

            searchResult['user'] = tempSearchResult['user']?.id || null;
            delete searchResult['category'];
            delete searchResult['status'];
            searchResult['todoCategoryId'] = tempSearchResult['category']['value'].toString();
            searchResult['todoStatusId'] = tempSearchResult['status']['value'].toString();

            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all todo category by query parameters
    findAll = async (queryParams, tokenParseResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];

        try {
            if (!tokenParseResult || !tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const categoryFKFields = FKFields['category'];

            const statusFKFields = FKFields['status'];

            let tempSearchResult = [];

            if (!queryParams || Object.keys(queryParams).length === 0) {
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.todos.find(
                        {},
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                } else {
                    (tempSearchResult = await this.unitOfWork.todos.find({
                        user: toObjectId(tokenParseResult.userId),
                    })),
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields;
                }
                ///TODO: 使用 mongoose 的搜尋結果返回的資料是不可變的，故需要將其從 mongoose 的資料型態轉換成 object 才能夠讓其屬性被更動
                searchResult = tempSearchResult.map((item) => item.toObject());
                searchResult.forEach((item, index) => {
                    searchResult[index]['user'] = item['user']?._id || null;
                    searchResult[index]['category'] = item['category']['name'];
                    searchResult[index]['status'] = item['status']['name'];
                });
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);
                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                logInfo(`filterQueryResult: ${stringify(filterQueryResult)}`, fileDetails);
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.todos.find(
                        filterQueryResult.query,
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                } else {
                    const limitFilterQueryResult = {
                        $and: [
                            filterQueryResult.query,
                            {
                                user: toObjectId(tokenParseResult.userId),
                            },
                        ],
                    };
                    logInfo(`limitFilterQueryResult: ${stringify(limitFilterQueryResult)}`, fileDetails);
                    tempSearchResult = await this.unitOfWork.todos.find(
                        limitFilterQueryResult,
                        selectFields,
                        userFKFields,
                        categoryFKFields,
                        statusFKFields
                    );
                }
                ///TODO: 使用 mongoose 的搜尋結果返回的資料是不可變的，故需要將其從 mongoose 的資料型態轉換成 object 才能夠讓其屬性被更動
                searchResult = tempSearchResult.map((item) => item.toObject());
                searchResult.forEach((item, index) => {
                    searchResult[index]['user'] = item['user']['_id'];
                    searchResult[index]['category'] = item['category']['name'];
                    searchResult[index]['status'] = item['status']['name'];
                });
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoService;
