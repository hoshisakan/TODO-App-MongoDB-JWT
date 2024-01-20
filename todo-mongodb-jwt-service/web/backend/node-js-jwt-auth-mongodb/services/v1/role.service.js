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

class RoleService extends BaseService {
    constructor() {
        super(unitOfWork.roles);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'Role';
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

    ///TODO: Create new role
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

            ///TODO: Step 2: Get duplicate existing query
            const duplicateCheckEntity = {
                name: entity.name,
                level: entity.level,
            };

            const duplicateExistingQuery = await checkDuplicateExisting(duplicateCheckEntity, this.modelName, 'create');

            logInfo(`Duplicate existing query: ${stringify(duplicateExistingQuery)}`, fileDetails);

            if (!duplicateExistingQuery || duplicateExistingQuery.error) {
                throw new Error(duplicateExistingQuery.error);
            }

            ///TODO: Step 3: Check duplicate existing by query, if found then create new entity
            const duplicateExistingResult = await this.unitOfWork.roles.findOne(duplicateExistingQuery);

            if (duplicateExistingResult) {
                throw new Error(
                    `Role with name ${duplicateCheckEntity.name} already exists`
                );
            }

            ///TODO: Step 4: Create new entity
            const createResult = await this.unitOfWork.roles.create(entity);

            if (!createResult) {
                throw new Error('Create role failed');
            }
            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Create bulk roles
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

            ///TODO: Step 2: Get duplicate existing query
            const duplicateCheckEntities = entities.map((entity) => {
                return {
                    name: entity.name,
                    level: entity.level,
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
            const duplicateExistingResult = await this.unitOfWork.roles.find(duplicateExistingQuery);

            logInfo(`Duplicate existing result: ${stringify(duplicateExistingResult)}`, fileDetails);

            if (Object.keys(duplicateExistingResult).length > 0) {
                throw new Error(`Role with name or level already exists`);
            }

            ///TODO: Step 4: Create new entity
            const createResult = await this.unitOfWork.roles.createMany(entities);

            if (!createResult) {
                throw new Error('Create bulk roles failed');
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

            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid || validateResult.error) {
                throw new Error(validateResult.error);
            }

            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName, 'update');

            logInfo(`Duplicate existing query: ${stringify(duplicateExistingQuery)}`, fileDetails);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const duplicateItemsFound = await this.unitOfWork.roles.find(duplicateExistingQuery);

            if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                logInfo(`Duplicate items found: ${stringify(duplicateItemsFound)}`, fileDetails);
                throw new Error(
                    // `Role with name ${entity.name} or level ${entity.level} already exists`
                    `Role with name ${entity.name} or level ${entity.level} already exists`
                );
            }

            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            logInfo(`Update query: ${stringify(updateQuery)}`, fileDetails);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            const filterCondition = {
                _id: id,
            };

            const updateResult = await this.unitOfWork.roles.findOneAndUpdate(filterCondition, updateQuery);

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

            if (entity._id !== id) {
                throw new Error(`Invalid parameters, id ${id} not match with entity id ${entity._id}`);
            }

            const validateResult = validateEntityParams(entity, this.modelName);

            if (!validateResult.isValid || validateResult.error) {
                throw new Error(validateResult.error);
            }

            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            const duplicateExistingQuery = await checkDuplicateExisting(entity, this.modelName, 'update');

            logInfo(`Duplicate existing query: ${stringify(duplicateExistingQuery)}`, fileDetails);

            if (!duplicateExistingQuery || Object.keys(duplicateExistingQuery).length === 0) {
                throw new Error('Invalid duplicate existing query');
            }

            const duplicateItemsFound = await this.unitOfWork.roles.find(duplicateExistingQuery);

            if (duplicateItemsFound && duplicateItemsFound.length > 0) {
                logInfo(`Duplicate items found: ${stringify(duplicateItemsFound)}`, fileDetails);
                throw new Error(
                    // `Role with name ${entity.name} or level ${entity.level} already exists`
                    `Role with name ${entity.name} or level ${entity.level} already exists`
                );
            }

            const updateQuery = setOneAndUpdateFields(entity, this.modelName, 'update');

            logInfo(`Update query: ${stringify(updateQuery)}`, fileDetails);

            if (!updateQuery || Object.keys(updateQuery).length === 0) {
                throw new Error('Invalid update query');
            }

            const filterCondition = {
                _id: id,
            };

            const updateResult = await this.unitOfWork.roles.updateOne(filterCondition, updateQuery);

            if (!updateResult) {
                throw new Error('Update role failed');
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

            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            const deleteResult = await this.unitOfWork.roles.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete role failed');
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
            const deleteResult = await this.unitOfWork.roles.deleteMany({});
            if (!deleteResult) {
                throw new Error('Delete all roles failed');
            }
            return deleteResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find one role by query parameters
    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.roles.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.roles.findOne(filterQueryResult.query);
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
            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all role by query parameters
    findAll = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.roles.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.roles.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = RoleService;
