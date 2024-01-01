const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const { getFilterQuery } = require('../../utils/logic.check.util');

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

    isAnyFieldExists = (queryParamsKeys = []) => {
        return queryParamsKeys.length > 0;
    };

    validateValuesContainsFilterFormat = (queryParamsValues = []) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = false;
        try {
            if (!queryParamsValues) {
                throw new Error('Invalid query parameters, please provide values');
            }
            const predicate = (value) => typeof value == 'string' || typeof value == 'object';
            result = queryParamsValues.every((value) => predicate(value));

            return result;
        } catch (err) {
            result = false;
            logError(err, fileDetails, true);
        }
        return result;
    };

    regexCheckIncludeSpecialCharacters = (value) => {
        if (!value) {
            throw new Error('Value is required');
        }
        const regex = /[,|]+/;
        return regex.test(value);
    };

    validateQueryParams = (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = true;
        try {
            const queryParamsKeys = Object.keys(queryParams);
            logInfo(`queryParamsKeys: ${stringify(queryParamsKeys)}`, fileDetails, true);

            const isAnyFieldExists = this.isAnyFieldExists(queryParamsKeys);
            logInfo(`isAnyFieldExists: ${stringify(isAnyFieldExists)}`, fileDetails, true);

            if (!isAnyFieldExists) {
                throw new Error('Invalid query parameters, please provide at least one field');
            }
            const isAuthenticityFieldsExists = validateFieldsAuthenticity(queryParamsKeys, 'Role');
            logInfo(`isAuthenticityFieldsExists: ${stringify(isAuthenticityFieldsExists)}`, fileDetails, true);

            if (!isAuthenticityFieldsExists) {
                throw new Error('Invalid query parameters, please provide authenticity fields');
            }

            const queryParamsValues = Object.values(queryParams);
            // logInfo(`queryParamsValues: ${stringify(queryParamsValues)}`, fileDetails, true);

            const isValidateValuesContainsFilterFormat = this.validateValuesContainsFilterFormat(queryParamsValues);
            logInfo(
                `isValidateValuesContainsFilterFormat: ${stringify(isValidateValuesContainsFilterFormat)}`,
                fileDetails,
                true
            );

            if (!isValidateValuesContainsFilterFormat) {
                throw new Error('Invalid query parameters, please provide correct filter values in query parameters');
            }
        } catch (err) {
            result = false;
            logError(err, fileDetails, true);
            throw err;
        }
        return result;
    };

    ///TODO: Search roles by name
    searchRolesByName = async (roles = []) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = [];
        try {
            result = await this.unitOfWork.roles.find({ name: { $in: roles } });
            // logInfo(`searchRolesByName result: ${stringify(result)}`, fileDetails, true);
            if (!result) {
                throw new Error('Search roles by name list failed, please provide correct roles list');
            }
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };

    convertQueryParamsToMongoQuery = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {};
        let newValue = [];
        try {
            if (!queryParams) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }
            const queryParamsEntries = Object.entries(queryParams);
            logInfo(`queryParamsEntries: ${stringify(queryParamsEntries)}`, fileDetails, true);

            if (!queryParamsEntries) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }

            for (const [key, value] of queryParamsEntries) {
                logInfo(`key: ${stringify(key)}`, fileDetails, true);
                logInfo(`value: ${stringify(value)}`, fileDetails, true);
                newValue = String(value).split(',');

                if (key === 'roles') {
                    const searchRolesByNameResult = await this.searchRolesByName(newValue);
                    logInfo(`searchRolesByNameResult: ${stringify(searchRolesByNameResult)}`, fileDetails, true);
                    const searchRolesIds = searchRolesByNameResult.map((role) => role._id);
                    newValue = searchRolesIds;
                }
                logInfo(`newValue: ${stringify(newValue)}`, fileDetails, true);
                result[key] = { $in: newValue };
            }
            return result;
        } catch (err) {
            result = {};
            logError(err, fileDetails, true);
            throw err;
        }
    };

    getFilterQuery = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {};
        try {
            if (!queryParams) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }
            const validateQueryParamsResult = this.validateQueryParams(queryParams);
            if (!validateQueryParamsResult) {
                throw new Error(
                    'Invalid query parameters, pleace check your query parameters whether they are correct or not'
                );
            }
            result = await this.convertQueryParamsToMongoQuery(queryParams);
            if (!result || result.error || Object.keys(result).length === 0) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }
            logInfo(`getFilterQuery result: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            result = {};
            logError(err, fileDetails, true);
            throw err;
        }
        return result;
    };

    create = async (entity) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result;
        try {
            if (!entity) {
                throw new Error('Invalid entity, please provide entity');
            }
            result = await this.unitOfWork.todos.create(entity);

            if (!result) {
                throw new Error('Create todo failed, please provide correct entity');
            }
            logInfo(`create result: ${stringify(result)}`, fileDetails, true);

            const todoId = result._id;

            if (!todoId) {
                throw new Error('Create todo failed, please provide correct entity');
            }

            const todoCategoryId = entity.todos;

            if (!todoCategoryId) {
                throw new Error('Create todo failed, please provide correct entity');
            }

            const addTodoCategoryResult = await this.unitOfWork.todos.addTodoCategory(todoId, todoCategoryId);

            if (!addTodoCategoryResult) {
                throw new Error('Create todo failed, please provide correct entity');
            }

            logInfo(`addTodoCategoryResult: ${stringify(addTodoCategoryResult)}`, fileDetails, true);

            return result;
        } catch (error) {
            logError(error, fileDetails, true);
        }
        return result;
    };

    ///TODO: Find one user by query parameters
    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = [];
        let filterQuery = {};

        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                filterQuery = {};
            } else {
                const validateQueryParamsResult = this.validateQueryParams(queryParams);

                if (!validateQueryParamsResult) {
                    throw new Error(
                        'Invalid query parameters, pleace check your query parameters whether they are correct or not'
                    );
                }
                filterQuery = await this.getFilterQuery(queryParams);
                logInfo(`filterQuery: ${stringify(filterQuery)}`, fileDetails, true);

                if (!filterQuery) {
                    throw new Error('Invalid query parameters, please provide query parameters');
                }
            }
            result = await this.unitOfWork.todos.findOne(filterQuery);
        } catch (error) {
            logError(error, fileDetails, true);
        }
        return result;
    };

    ///TODO: Find one todo category by query parameters
    findOne = async (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = [];
        try {
            if (!queryParams || Object.keys(queryParams).length === 0) {
                searchResult = await this.unitOfWork.todos.findOne({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todos.findOne(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
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
                searchResult = await this.unitOfWork.todos.find({});
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                searchResult = await this.unitOfWork.todos.find(filterQueryResult.query);
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };
}

module.exports = TodoService;
