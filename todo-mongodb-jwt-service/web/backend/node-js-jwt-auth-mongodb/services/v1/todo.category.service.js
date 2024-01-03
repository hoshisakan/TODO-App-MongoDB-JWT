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

    create = async (entity) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entity) {
                throw new Error('Invalid entity');
            }

            ///TODO: Step 1: Validate entity params
            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step 2: Get duplicate existing query
            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName, 'create');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            ///TODO: Step 3: Check duplicate existing by query, if found, throw error
            const todoCategoryFound = await this.unitOfWork.todoCategories.findOne(duplicateExistingQuery);

            if (todoCategoryFound) {
                throw new Error('Todo category already exists');
            }

            logInfo(`todoCategoryFound: ${stringify(todoCategoryFound)}`, fileDetails, true);

            ///TODO: Step 4: Create todo category
            const todoCategoryCreated = await this.unitOfWork.todoCategories.create(entity);

            if (!todoCategoryCreated) {
                throw new Error('Todo category creation failed');
            }

            logInfo(`todoCategoryCreated: ${stringify(todoCategoryCreated)}`, fileDetails, true);

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

            const duplicateExistingQuery = await checkMultipleDuplicateExisting(entities, this.modelName, 'create');

            logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const todoCategoryFound = await this.unitOfWork.todoCategories.find(duplicateExistingQuery);

            if (todoCategoryFound && todoCategoryFound.length > 0) {
                throw new Error('Todo category already exists');
            }

            logInfo(`todoCategoryFound: ${stringify(todoCategoryFound)}`, fileDetails, true);

            const todoCategoryCreated = await this.unitOfWork.todoCategories.createMany(entities);

            if (!todoCategoryCreated) {
                throw new Error('Todo category creation failed');
            }
            return todoCategoryCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Bulk update todo category
    // bulkUpdate = async (entities) => {
    //     const classAndFuncName = this.getFunctionCallerName();
    //     const fileDetails = this.getFileDetails(classAndFuncName);
    //     try {
    //         if (!entities) {
    //             throw new Error('Invalid entity');
    //         }

    //         const validateResult = validateEntitiesParams(entities, this.modelName);

    //         if (!validateResult.isValid) {
    //             throw new Error(validateResult.error);
    //         }

    //         const duplicateExistingQuery = await this.checkMultipleUpdateDuplicateExisting(entities);

    //         logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

    //         // logInfo(`todoCategoryFound: ${stringify(todoCategoryFound)}`, fileDetails, true);

    //         // const todoCategoryUpdated = await this.unitOfWork.todoCategories.updateMany(entities);

    //         // if (!todoCategoryUpdated) {
    //         //     throw new Error('Todo category update failed');
    //         // }

    //         // return todoCategoryUpdated;

    //         return 'bulkUpdate';
    //     } catch (error) {
    //         // logError(error, fileDetails, true);
    //         throw error;
    //     }
    // };

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

            const todoCategoryFound = await this.unitOfWork.todoCategories.findById(id);

            if (!todoCategoryFound) {
                throw new Error('Todo category not found with the provided id');
            }

            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName, 'update');

            // logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const duplicateItemsFound = await this.unitOfWork.todoCategories.find(duplicateExistingQuery);

            // logInfo(`duplicateItemsFound: ${stringify(duplicateItemsFound)}`, fileDetails, true);

            if (duplicateItemsFound && duplicateItemsFound > 0) {
                ///TODO: check duplicate items found, cannnot use some or every, because it will return true if the first item is duplicate
                ///TODO: reminder: some and every will return true if the first item is duplicate
                ///TODO: reminder: _id is not a string, it is an object, so we need to convert it to string
                const duplicateItems = duplicateItemsFound.filter(
                    (item) =>
                        item._id.toString() !== entity._id.toString() &&
                        (item.name.toString() === entity.name.toString() ||
                            item.value.toString() === entity.value.toString())
                );

                // const duplicateItems = duplicateItemsFound.filter((item) => {
                //     const isSameId = item._id.toString() === entity._id.toString();
                //     const isSameName = item.name.toString() === entity.name.toString();
                //     const isSameValue = item.value.toString() === entity.value.toString();

                //     logInfo(
                //         `Checking item ${item._id}: isSameId=${isSameId}, isSameName=${isSameName}, isSameValue=${isSameValue}`,
                //         fileDetails
                //     );

                //     return !isSameId && (isSameName || isSameValue);
                // });

                // logInfo(`duplicateItems: ${stringify(duplicateItems)}`, fileDetails, true);

                if (duplicateItems && duplicateItems.length > 0) {
                    throw new Error('Todo category already exists, because of duplicate name or value');
                }
                logInfo(`duplicateItems: ${stringify(duplicateItems)}`, fileDetails, true);
            }

            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: id };

            ///TODO: option add new attribute for return modified document instead of original
            const todoCategoryUpdated = await this.unitOfWork.todoCategories.findOneAndUpdate(
                filterCondition,
                updateQuery
            );

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

            const todoCategoryFound = await this.unitOfWork.todoCategories.findById(id);

            if (!todoCategoryFound) {
                throw new Error('Todo category not found with the provided id');
            }

            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName, 'update');

            // logInfo(`duplicateExistingQuery: ${stringify(duplicateExistingQuery)}`, fileDetails, true);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const duplicateItemsFound = await this.unitOfWork.todoCategories.find(duplicateExistingQuery);

            // logInfo(`duplicateItemsFound: ${stringify(duplicateItemsFound)}`, fileDetails, true);

            if (!duplicateItemsFound || duplicateItemsFound.length === 0) {
                throw new Error('Todo category not found with the provided query');
            }

            if (duplicateItemsFound && duplicateItemsFound > 0) {
                ///TODO: check duplicate items found, cannnot use some or every, because it will return true if the first item is duplicate
                ///TODO: reminder: some and every will return true if the first item is duplicate
                ///TODO: reminder: _id is not a string, it is an object, so we need to convert it to string
                const duplicateItems = duplicateItemsFound.filter(
                    (item) =>
                        item._id.toString() !== entity._id.toString() &&
                        (item.name.toString() === entity.name.toString() ||
                            item.value.toString() === entity.value.toString())
                );

                // const duplicateItems = duplicateItemsFound.filter((item) => {
                //     const isSameId = item._id.toString() === entity._id.toString();
                //     const isSameName = item.name.toString() === entity.name.toString();
                //     const isSameValue = item.value.toString() === entity.value.toString();

                //     logInfo(
                //         `Checking item ${item._id}: isSameId=${isSameId}, isSameName=${isSameName}, isSameValue=${isSameValue}`,
                //         fileDetails
                //     );

                //     return !isSameId && (isSameName || isSameValue);
                // });

                // logInfo(`duplicateItems: ${stringify(duplicateItems)}`, fileDetails, true);

                if (duplicateItems && duplicateItems.length > 0) {
                    throw new Error('Todo category already exists, because of duplicate name or value');
                }
            }

            const updateQuery = setOneAndUpdateFields(entity, this.modelName);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            logInfo(`updateQuery: ${stringify(updateQuery)}`, fileDetails, true);

            updateQuery.updatedAt = Date.now();

            const filterCondition = { _id: entity._id };

            const todoCategoryUpdated = await this.unitOfWork.todoCategories.updateOne(filterCondition, updateQuery);

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
        // const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id) {
                throw new Error('Invalid id');
            }

            const todoCategoryFound = await this.unitOfWork.todoCategories.findById(id);

            if (!todoCategoryFound) {
                throw new Error('Todo category not found with the provided id');
            }

            const todoCategoryDeleted = await this.unitOfWork.todoCategories.deleteOne({ _id: id });

            if (!todoCategoryDeleted) {
                throw new Error('Todo category deletion failed');
            }
            return todoCategoryDeleted;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    deleteAll = async () => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const deleteResult = await this.unitOfWork.todoCategories.deleteMany({});
            if (!deleteResult) {
                throw new Error('Todo category deletion failed');
            }
            return deleteResult;
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
            const searchResult = await this.unitOfWork.todoCategories.findById(id);

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
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoCategoryService;
