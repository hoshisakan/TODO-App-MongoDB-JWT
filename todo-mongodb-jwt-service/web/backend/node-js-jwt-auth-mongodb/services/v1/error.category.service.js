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

class ErrorCategoryService extends BaseService {
    constructor() {
        super(unitOfWork.errorCategories);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'ErrorCategory';
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

    ///TODO: Create new errorCategory
    create = async (entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entity) {
                throw new Error(`Entity is empty`);
            }

            ///TODO: Step 4: Create new entity
            const createResult = await this.unitOfWork.errorCategories.create(entity);

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

            ///TODO: Step 2: Get duplicate existing query
            const duplicateCheckEntities = entities.map((entity) => {
                return {
                    name: entity.name,
                };
            });

            const duplicateExistingQuery = await checkMultipleDuplicateExisting(
                duplicateCheckEntities,
                this.modelName,
                'create'
            );

            logInfo(`Duplicate existing query: ${stringify(duplicateExistingQuery)}`, fileDetails);

            if (!duplicateExistingQuery || duplicateExistingQuery.error) {
                throw new Error(duplicateExistingQuery.error);
            }

            ///TODO: Step 3: Check duplicate existing by query, if found then create new entity
            const duplicateExistingResult = await this.unitOfWork.errorCategories.find(duplicateExistingQuery);

            logInfo(`Duplicate existing result: ${stringify(duplicateExistingResult)}`, fileDetails);

            if (Object.keys(duplicateExistingResult).length > 0) {
                throw new Error(`Error category with name already exists`);
            }

            ///TODO: Step 4: Create new entity
            const createResult = await this.unitOfWork.errorCategories.insertMany(entities);

            if (!createResult) {
                throw new Error('Create bulk errorCategories failed');
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

            const searchResult = await this.unitOfWork.errorCategories.findById(id);

            if (!searchResult) {
                throw new Error(`Error category with id ${id} not found`);
            }

            const filterCondition = {
                _id: id,
            };

            entity.updatedAt = new Date();

            const updateResult = await this.unitOfWork.errorCategories.findOneAndUpdate(filterCondition, entity);

            if (!updateResult) {
                throw new Error('Update role failed');
            }
            return updateResult;
        } catch (error) {
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

            entity.updatedAt = new Date();

            const updateResult = await this.unitOfWork.errorCategories.findByIdAndUpdate(id, entity);

            if (!updateResult) {
                throw new Error('Update error category failed');
            }
            return updateResult;
        } catch (error) {
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

            const searchResult = await this.unitOfWork.errorCategories.findById(id);

            if (!searchResult) {
                throw new Error(`Error category with id ${id} not found`);
            }

            const deleteResult = await this.unitOfWork.errorCategories.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete error category failed');
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
            const deleteResult = await this.unitOfWork.errorCategories.deleteMany({});
            if (!deleteResult) {
                throw new Error('Delete all error category failed');
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
                searchResult = await this.unitOfWork.errorCategories.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.errorCategories.findOne(filterQueryResult.query);
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
            const searchResult = await this.unitOfWork.errorCategories.findById(id);

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
                searchResult = await this.unitOfWork.errorCategories.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.errorCategories.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = ErrorCategoryService;
