const { logInfo, logError } = require('../../utils/log.util');
// const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const { getFilterQuery } = require('../../utils/logic.check.util');
const { getSelectFields, getSelectFKFields, validObjectId } = require('../../utils/mongoose.filter.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../../repositories/unitwork');
const unitOfWork = new UnitOfWork();

class UserService extends BaseService {
    constructor() {
        super(unitOfWork.users);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'User';
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

    checkUserExistsByUsername = async (username) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = false;
        try {
            if (!username) {
                throw new Error('Username is required');
            }
            result = (await this.unitOfWork.users.findOne({ username: username })) ? true : false;
        } catch (err) {
            result = false;
            logError(err, fileDetails, true);
        }
        return result;
    };

    checkUserExistsByEmail = async (email) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = false;
        try {
            if (!email) {
                throw new Error('Email is required');
            }
            result = (await this.unitOfWork.users.findOne({ email: email })) ? true : false;
        } catch (err) {
            result = false;
            // logError(err, fileDetails, true);
        }
        return result;
    };

    deleteById = async (id) => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!id || !validObjectId(id)) {
                throw new Error(`Invalid parameters`);
            }

            const searchResult = await this.unitOfWork.users.findById(id);

            if (!searchResult) {
                throw new Error(`Role with id ${id} not found`);
            }

            const deleteResult = await this.unitOfWork.users.deleteOne({ _id: id });

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
            const deleteResult = await this.unitOfWork.users.deleteMany({});
            if (!deleteResult) {
                throw new Error('Delete all users failed');
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
        let searchResult = {};
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.users.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }

                const selectFields = getSelectFields(this.modelName);
                const FKFields = getSelectFKFields(this.modelName);
                const roleFKFields = FKFields['role'];
                searchResult = await this.unitOfWork.users.findOne(filterQueryResult.query, selectFields, roleFKFields);
            }
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find role by id
    findById = async (id) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = {};
        try {
            if (!id) {
                throw new Error('Id is required');
            }
            const selectFields = getSelectFields(this.modelName);
            const FKFields = getSelectFKFields(this.modelName);
            const roleFKFields = FKFields['role'];

            const tempSearchResult = await this.unitOfWork.users.findById(id, selectFields, roleFKFields);

            if (!tempSearchResult) {
                throw new Error('User not found');
            }

            searchResult = tempSearchResult.toObject();
            // searchResult['roles'][0]['name'] = 111;

            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };

    ///TODO: Find all user by query parameters
    findAll = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            const selectFields = getSelectFields(this.modelName);
            const FKFields = getSelectFKFields(this.modelName);
            const roleFKFields = FKFields['role'];

            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.users.find({}, selectFields, roleFKFields);
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }

                searchResult = await this.unitOfWork.users.find(filterQueryResult.query, selectFields, roleFKFields);
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = UserService;
