const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const { getFilterQuery, checkMultipleDuplicateExisting } = require('../../utils/logic.check.util');
const { getSelectFields, validObjectId } = require('../../utils/mongoose.filter.util');

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

            const createResult = await this.unitOfWork.todoCategories.create(entity);

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

    ///TODO: Bulk create todo category
    bulkCreate = async (entities) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entities) {
                throw new Error('Invalid entity');
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

            const todoCategoryCreated = await this.unitOfWork.todoCategories.insertMany(entities);

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
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            const searchResult = await this.unitOfWork.todoCategories.findById(id);

            if (!searchResult) {
                throw new Error(`Todo category with id ${id} not found`);
            }
            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.name) {
                oldRecord.name = entity.name;
            }
            if (entity.value) {
                oldRecord.value = entity.value;
            }
            oldRecord.updatedAt = new Date();

            const filterCondition = {
                _id: id,
            };
            const updateResult = await this.unitOfWork.todoCategories.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update todo category failed');
            }
            return updateResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    updateById = async (id, entity) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            const searchResult = await this.unitOfWork.todoCategories.findById(id);

            if (!searchResult) {
                throw new Error(`Todo category with id ${id} not found`);
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.name) {
                oldRecord.name = entity.name;
            }
            if (entity.value) {
                oldRecord.value = entity.value;
            }
            oldRecord.updatedAt = new Date();

            const filterCondition = { _id: id };
            const updateResult = await this.unitOfWork.todoCategories.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update todo category failed');
            }
            return updateResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    deleteById = async (id) => {
        const classAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id || !validObjectId(id)) {
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
            if (!id || !validObjectId(id)) {
                throw new Error(`Not found id ${id}.`);
            }
            const searchResult = await this.unitOfWork.todoCategories.findById(id);

            if (!searchResult) {
                throw new Error(`Todo category with id ${id} not found`);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all todo category by query parameters
    findAll = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            const selectField = getSelectFields(this.modelName);
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todoCategories.find({}, selectField);
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todoCategories.find(filterQueryResult.query, selectField);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoCategoryService;
