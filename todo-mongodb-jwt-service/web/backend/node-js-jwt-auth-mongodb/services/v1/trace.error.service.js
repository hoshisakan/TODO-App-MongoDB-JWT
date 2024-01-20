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
const { todoCategory } = require('../../models/mongodb');
const unitOfWork = new UnitOfWork();

class TraceErrorService extends BaseService {
    constructor() {
        super(unitOfWork.errorCategories);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'TraceError';
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

    getCategoriyErrorIds = async (categoryNames) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = null;
        try {
            if (!categoryNames) {
                throw new Error(`Category name is empty`);
            }

            if (!Array.isArray(categoryNames)) {
                searchResult = (await this.unitOfWork.errorCategories.findOne({ name: categoryNames })) || null;
            } else {
                searchResult = (await this.unitOfWork.errorCategories.find({ name: { $in: categoryNames } })) || null;
            }
        } catch (error) {
            // logError(error, fileDetails, true);
        }
        return searchResult;
    };

    ///TODO: Create new errorCategory
    create = async (entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entity) {
                throw new Error(`Entity is empty`);
            }

            ///TODO: Step 1: Validate entity params
            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid || validateResult.error) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step 2: Get error category id
            const searchErrorCategoryIdResult = await this.getCategoriyErrorIds(entity.errorCategoryName);

            logInfo(`searchErrorCategoryIdResult: ${stringify(searchErrorCategoryIdResult)}`, fileDetails, true);

            const errorCategoryId = searchErrorCategoryIdResult && searchErrorCategoryIdResult._id;

            if (!errorCategoryId) {
                throw new Error(`Error category with name ${entity.errorCategoryName} not found`);
            }

            ///TODO: Step 3: Set error category id, delete error category name
            entity.errorCategory = errorCategoryId;
            delete entity.errorCategoryName;

            logInfo(`Entity: ${stringify(entity)}`, fileDetails);

            ///TODO: Step 3: Create new entity
            const createResult = await this.unitOfWork.traceErrors.create(entity);

            if (!createResult) {
                throw new Error('Create error category failed');
            }
            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Create bulk errorCategories
    bulkCreate = async (entities) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entities || entities.length === 0) {
                throw new Error(`Entities is empty`);
            }

            ///TODO: Step 1: Validate entities params
            const validateResult = validateEntitiesParams(entities, this.modelName);

            if (!validateResult.isValid || validateResult.error) {
                throw new Error(validateResult.error);
            }

            ///TODO: Step 2: Map error category names
            const errorCategoryNames = entities.map((entity) => entity.errorCategoryName);

            ///TODO: Step 3: Get error category ids
            const errorCategoryIds = await this.getCategoriyErrorIds(errorCategoryNames);

            if (!errorCategoryIds || errorCategoryIds.length === 0) {
                throw new Error(`Error categories with names ${errorCategoryNames} not found`);
            }

            ///TODO: Step 4: Set error category ids, delete error category names
            entities.forEach((entity, index) => {
                entity.errorCategory = errorCategoryIds[index];
                delete entity.errorCategoryName;
            });

            ///TODO: Step 5: Create new entities
            const createResult = await this.unitOfWork.traceErrors.createMany(entities);

            if (!createResult) {
                throw new Error('Create bulk trace errors failed');
            }
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    patchUpdateById = async (id, entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!id || !entity) {
                throw new Error(`Invalid parameters`);
            }

            if (entity._id !== id) {
                throw new Error(`Invalid parameters, id ${id} not match with entity id ${entity._id}`);
            }

            ///TODO: Update query
            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            logInfo(`Update query: ${stringify(updateQuery)}`, fileDetails);

            if (!updateQuery) {
                throw new Error(`Update query is empty`);
            }

            ///TODO: Check the error category name is existed or not in database, if existed, get the id and set to update query
            if (updateQuery.errorCategoryName) {
                const errorCategoryFoundResult = await this.getCategoriyErrorIds(entity.errorCategoryName);

                if (errorCategoryFoundResult) {
                    updateQuery.errorCategory = errorCategoryFoundResult._id;
                    delete updateQuery.errorCategoryName;
                }
                else {
                    throw new Error(`Error category with name ${entity.errorCategoryName} not found`);
                }
            }
            updateQuery.updatedAt = new Date();

            const filterCondition = {
                _id: entity._id,
            };

            ///TODO: Update entity
            const updateResult = await this.unitOfWork.traceErrors.findOneAndUpdate(filterCondition, updateQuery);

            if (!updateResult) {
                throw new Error('Update trace error failed');
            }
            return updateResult;
        }
        catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    updateById = async (id, entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!id || !entity) {
                throw new Error(`Invalid parameters`);
            }

            if (entity._id !== id) {
                throw new Error(`Invalid parameters, id ${id} not match with entity id ${entity._id}`);
            }

            ///TODO: Update query
            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            logInfo(`Update query: ${stringify(updateQuery)}`, fileDetails);

            if (!updateQuery) {
                throw new Error(`Update query is empty`);
            }

            ///TODO: Check the error category name is existed or not in database, if existed, get the id and set to update query
            if (updateQuery.errorCategoryName) {
                const errorCategoryFoundResult = await this.getCategoriyErrorIds(entity.errorCategoryName);

                if (errorCategoryFoundResult) {
                    updateQuery.errorCategory = errorCategoryFoundResult._id;
                    delete updateQuery.errorCategoryName;
                }
                else {
                    throw new Error(`Error category with name ${entity.errorCategoryName} not found`);
                }
            }
            updateQuery.updatedAt = new Date();

            const filterCondition = {
                _id: entity._id,
            };

            ///TODO: Update entity
            const updateResult = await this.unitOfWork.traceErrors.findOneAndReplace(filterCondition, updateQuery);

            if (!updateResult) {
                throw new Error('Update trace error failed');
            }
            return updateResult;
        }
        catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    deleteById = async (id) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!id) {
                throw new Error(`Invalid parameters`);
            }

            const searchResult = await this.unitOfWork.traceErrors.findById(id);

            if (!searchResult) {
                throw new Error(`Trace error with id ${id} not found`);
            }

            const deleteResult = await this.unitOfWork.traceErrors.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete trace error failed');
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
            const deleteResult = await this.unitOfWork.traceErrors.deleteMany({});
            if (!deleteResult) {
                throw new Error('Delete all trace error failed');
            }
            return deleteResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find one role by query parameters
    findOne = async (queryParams) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.traceErrors.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.traceErrors.findOne(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findById = async (id) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const searchResult = await this.unitOfWork.traceErrors.findById(id);

            if (!searchResult) {
                throw new Error(`Error category with id ${id} not found`);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all role by query parameters
    findAll = async (queryParams) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.traceErrors.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.traceErrors.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TraceErrorService;
