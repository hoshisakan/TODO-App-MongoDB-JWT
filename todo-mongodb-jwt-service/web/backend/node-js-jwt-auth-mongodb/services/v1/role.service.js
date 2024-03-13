const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const {
    getFilterQuery,
    checkMultipleDuplicateExisting,
} = require('../../utils/logic.check.util');
const { validObjectId } = require('../../utils/mongoose.filter.util');

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

            const duplicateExistingResult = await this.unitOfWork.roles.find(duplicateExistingQuery);

            logInfo(`Duplicate existing result: ${stringify(duplicateExistingResult)}`, fileDetails);

            if (Object.keys(duplicateExistingResult).length > 0) {
                throw new Error(`Role with name or level already exists`);
            }

            const createResult = await this.unitOfWork.roles.insertMany(entities);

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
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.name) {
                oldRecord.name = entity.name;
            }
            if (entity.level) {
                oldRecord.level = entity.level;
            }
            oldRecord.updatedAt = new Date();

            const filterCondition = {
                _id: id,
            };
            const updateResult = await this.unitOfWork.roles.findOneAndUpdate(filterCondition, oldRecord);

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
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            const searchResult = await this.unitOfWork.roles.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.name) {
                oldRecord.name = entity.name;
            }
            if (entity.level) {
                oldRecord.level = entity.level;
            }
            oldRecord.updatedAt = new Date();

            const filterCondition = { _id: id };
            ///TODO: The findOneAndUpdate method if entity any field is empty, then will be set that value is null or remove field
            const updateResult = await this.unitOfWork.roles.findOneAndUpdate(filterCondition, oldRecord);

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
            if (!id || !validObjectId(id)) {
                throw new Error(`Invalid id`);
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
            if (!id || !validObjectId(id)) {
                throw new Error('Invalid Id');
            }

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
