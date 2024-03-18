const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const { getFilterQuery, checkMultipleDuplicateExisting } = require('../../utils/logic.check.util');
const { getSelectFields, validObjectId } = require('../../utils/mongoose.filter.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../../repositories/unitwork');
const unitOfWork = new UnitOfWork();

class TodoStatusService extends BaseService {
    constructor() {
        super(unitOfWork.todoStatuses);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'TodoStatus';
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

            const createResult = await this.unitOfWork.todoStatuses.create(entity);

            if (!createResult) {
                throw new Error('Todo status creation failed');
            }

            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

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

            const todoStatusFound = await this.unitOfWork.todoStatuses.find(duplicateExistingQuery);

            if (todoStatusFound && todoStatusFound.length > 0) {
                throw new Error('Todo status already exists');
            }
            logInfo(`todoStatusFound: ${stringify(todoStatusFound)}`, fileDetails, true);

            const todoStatusCreated = await this.unitOfWork.todoStatuses.insertMany(entities);

            if (!todoStatusCreated) {
                throw new Error('Todo status creation failed');
            }
            return todoStatusCreated;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

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

    //         // logInfo(`todoStatusFound: ${stringify(todoStatusFound)}`, fileDetails, true);

    //         // const todoStatusUpdated = await this.unitOfWork.todoStatuses.updateMany(entities);

    //         // if (!todoStatusUpdated) {
    //         //     throw new Error('Todo status update failed');
    //         // }

    //         // return todoStatusUpdated;

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

            const searchResult = await this.unitOfWork.todoStatuses.findById(id);

            if (!searchResult) {
                throw new Error(`Todo status with id ${id} not found`);
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
            const updateResult = await this.unitOfWork.todoStatuses.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update todo status failed');
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

            const searchResult = await this.unitOfWork.todoStatuses.findById(id);

            if (!searchResult) {
                throw new Error(`Todo status with id ${id} not found`);
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
            const updateResult = await this.unitOfWork.todoStatuses.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update todo status failed');
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

            const todoStatusFound = await this.unitOfWork.todoStatuses.findById(id);

            if (!todoStatusFound) {
                throw new Error('Todo status not found with the provided id');
            }

            const todoStatusDeleted = await this.unitOfWork.todoStatuses.deleteOne({ _id: id });

            if (!todoStatusDeleted) {
                throw new Error('Todo status deletion failed');
            }
            return todoStatusDeleted;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    deleteAll = async () => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const deleteResult = await this.unitOfWork.todoStatuses.deleteMany({});
            if (!deleteResult) {
                throw new Error('Todo status deletion failed');
            }
            return deleteResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todoStatuses.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todoStatuses.findOne(filterQueryResult.query);
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
            const searchResult = await this.unitOfWork.todoStatuses.findById(id);

            if (!searchResult) {
                throw new Error(`Todo status with id ${id} not found`);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findAll = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            const selectField = getSelectFields(this.modelName);
            const sortFields = { value: 1 };

            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todoStatuses.find({}, selectField, sortFields);
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todoStatuses.find(
                    filterQueryResult.query,
                    selectField,
                    sortFields
                );
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoStatusService;
