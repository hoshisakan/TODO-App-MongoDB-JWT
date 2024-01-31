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
        super(unitOfWork.traceErrors);
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
    getIdsByValue = async (errorCategoryValues) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let ids = [];
        try {
            if (!errorCategoryValues) {
                throw new Error('Invalid todo category value');
            }

            logInfo(`errorCategoryValues: ${errorCategoryValues}`, fileDetails, true);

            if (!Array.isArray(errorCategoryValues) || errorCategoryValues.length === 0) {
                const filterResult = await this.unitOfWork.errorCategories.findOne({ name: errorCategoryValues });
                ids = filterResult._id;
            } else {
                const getArrayUniqueItemResult = await this.getArrayUniqueItem(errorCategoryValues);
                logInfo(`getArrayUniqueItemResult: ${stringify(getArrayUniqueItemResult)}`, fileDetails, true);

                if (
                    !getArrayUniqueItemResult &&
                    (!getArrayUniqueItemResult.arrayUniqueValues ||
                        getArrayUniqueItemResult.arrayUniqueValues.length === 0)
                ) {
                    throw new Error('Invalid error category value');
                }

                if (!getArrayUniqueItemResult.isDuplicate && getArrayUniqueItemResult.arrayUniqueValues.length > 0) {
                    const errorCategoriesItems = await this.unitOfWork.errorCategories.find({
                        name: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                    });
                    ids = errorCategoriesItems.map((errorCategoryItem) => errorCategoryItem._id);
                } else if (
                    getArrayUniqueItemResult.isDuplicate &&
                    getArrayUniqueItemResult.arrayUniqueValues.length > 0
                ) {
                    const errorCategoriesItems = await this.unitOfWork.errorCategories.find(
                        {
                            name: { $in: getArrayUniqueItemResult.arrayUniqueValues },
                        },
                        { name: 1 }
                    );
                    errorCategoryValues.forEach((value) => {
                        errorCategoriesItems.filter((items) => {
                            if (items.name.toString() === value.toString()) {
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

    ///TODO: Create traceError
    create = async (entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entity) {
                throw new Error(`Entity is empty`);
            }

            ///TODO: Step 1: Get error category id
            const searchIdResult = await this.getIdsByValue(entity.errorCategoryName);

            if (!searchIdResult || searchIdResult.length === 0) {
                throw new Error('Invalid trace category id');
            }

            ///TODO: Step 2: Set error category id, delete error category name
            entity.errorCategory = searchIdResult;
            delete entity.errorCategoryName;

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

    ///TODO: Create bulk traceErrors
    bulkCreate = async (entities) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!entities || entities.length === 0) {
                throw new Error(`Entities is empty`);
            }

            const errorCategoryNames = entities.map((entity) => entity.errorCategoryName);

            const errorCategoryIds = await this.getIdsByValue(errorCategoryNames);

            if (!errorCategoryIds || errorCategoryIds.length === 0) {
                throw new Error(`Error categories with names ${errorCategoryNames} not found`);
            }

            if (errorCategoryNames.length != errorCategoryIds.length) {
                throw new Error(`Two items does not match.`);
            }

            ///TODO: Step 3: Set error category ids, delete error category names
            entities.forEach((entity, index) => {
                entity.errorCategory = errorCategoryIds[index];
                delete entity.errorCategoryName;
            });

            ///TODO: Step 4: Create new entities
            const createResult = await this.unitOfWork.traceErrors.insertMany(entities);

            if (!createResult) {
                throw new Error('Create bulk trace errors failed');
            }
            // logInfo(`Create result: ${stringify(createResult)}`, fileDetails);
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

            const searchResult = await this.unitOfWork.traceErrors.findById(id);

            if (!searchResult) {
                throw new Error('Trace error not found with the provided id');
            }

            if (entity.errorCategoryName) {
                const errorCategoryFoundResult = await this.getIdsByValue(entity.errorCategoryName);

                if (errorCategoryFoundResult) {
                    entity.errorCategory = errorCategoryFoundResult._id;
                    delete entity.errorCategoryName;
                } else {
                    throw new Error(`Error category with name ${entity.errorCategoryName} not found`);
                }
            }
            entity.updatedAt = new Date();

            const filterCondition = {
                _id: id,
            };

            const updateResult = await this.unitOfWork.traceErrors.findOneAndUpdate(filterCondition, entity);

            if (!updateResult) {
                throw new Error('Update trace error failed');
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

            const isExists = await this.unitOfWork.traceErrors.findById(id);

            if (!isExists) {
                throw new Error(`Not found the id ${id}`);
            }

            ///TODO: Update query
            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            logInfo(`Update query: ${stringify(updateQuery)}`, fileDetails);

            if (!updateQuery) {
                throw new Error(`Update query is empty`);
            }

            ///TODO: Check the error category name is existed or not in database, if existed, get the id and set to update query
            if (updateQuery.errorCategoryName) {
                const errorCategoryFoundResult = await this.getIdsByValue(entity.errorCategoryName);

                if (errorCategoryFoundResult) {
                    updateQuery.errorCategory = errorCategoryFoundResult._id;
                    delete updateQuery.errorCategoryName;
                } else {
                    throw new Error(`Error category with name ${entity.errorCategoryName} not found`);
                }
            }
            updateQuery.updatedAt = new Date();

            const updateResult = await this.unitOfWork.traceErrors.findByIdAndUpdate(id, updateQuery);

            if (!updateResult) {
                throw new Error('Update trace error failed');
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
