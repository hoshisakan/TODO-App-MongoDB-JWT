const { logError, logInfo } = require('../utils/log.util.js');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util.js');
const { validateFieldsAuthenticity, validateModelFields } = require('../utils/model.validate.util');
const { fieldValidation } = require('../utils/validate.util.js').crudOperations;
const { validObjectId, toObjectId } = require('../utils/mongoose.filter.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();

const LogicCheckUtil = {
    ///TODO: Check any field exists, if exists then return true else return false
    checkAnyFieldExists: (queryParamsKeys = []) => {
        return queryParamsKeys.length > 0
            ? { isValid: true, error: null }
            : { isValid: false, error: 'No query parameters found' };
    },
    ///TODO: Search roles by name list
    searchRolesByName: async (roles = []) => {
        // const fileDetails = `[${filenameWithoutPath}] [searchRolesByName]`;
        let result = [];
        try {
            result = await unitOfWork.roles.find({ name: { $in: roles } });
            if (!result) {
                throw new Error('Search roles by name list failed, please provide correct role list');
            }
            return result;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Search todo category ids by name list
    searchCategoryIdByName: async (names = []) => {
        // const fileDetails = `[${filenameWithoutPath}] [searchRolesByName]`;
        let result = [];
        try {
            result = await unitOfWork.todoCategories.find({ name: { $in: names } });
            if (!result) {
                throw new Error('Search category id by name list failed, please provide correct name list');
            }
            return result;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Search todo status ids by name list
    searchStatusIdByName: async (names = []) => {
        // const fileDetails = `[${filenameWithoutPath}] [searchRolesByName]`;
        let result = [];
        try {
            result = await unitOfWork.todoStatuses.find({ name: { $in: names } });
            if (!result) {
                throw new Error('Search status id by name list failed, please provide correct name list');
            }
            return result;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Search ids by name list
    searchUserIdByName: async (names = []) => {
        // const fileDetails = `[${filenameWithoutPath}] [searchRolesByName]`;
        let result = [];
        try {
            result = await unitOfWork.users.find({ username: { $in: names } });
            if (!result) {
                throw new Error('Search user id by name list failed, please provide correct name list');
            }
            return result;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Validate values contains filter format, only string or object
    validateValuesContainsFilterFormat: (queryParamsValues = []) => {
        // const fileDetails = `[${filenameWithoutPath}] [validateValuesContainsFilterFormat]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!queryParamsValues) {
                throw new Error('Invalid query parameters, please provide values');
            }
            const predicate = (value) => typeof value == 'string' || typeof value == 'object';
            result.isValid = queryParamsValues.every((value) => predicate(value));
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Match regex check include special characters
    regexCheckIncludeSpecialCharacters: (value) => {
        if (!value) {
            throw new Error('Value is required');
        }
        const regex = /[,|]+/;
        return regex.test(value);
    },
    ///TODO: Validate query params with validate model
    validateQueryParams: (queryParams, validateModelName) => {
        const fileDetails = `[${filenameWithoutPath}] [validateQueryParams]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!queryParams) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }

            if (!validateModelName) {
                throw new Error('Invalid validate model name, please provide validate model name');
            }

            ///TODO: Step 1: Get query params keys
            const queryParamsKeys = Object.keys(queryParams);
            logInfo(`queryParamsKeys: ${stringify(queryParamsKeys)}`, fileDetails, true);

            ///TODO: Step 2: Check any field exists
            const isAnyFieldExists = LogicCheckUtil.checkAnyFieldExists(queryParamsKeys);
            logInfo(`isAnyFieldExists: ${stringify(isAnyFieldExists)}`, fileDetails, true);

            if (!isAnyFieldExists.isValid || isAnyFieldExists.error) {
                throw new Error(isAnyFieldExists.error);
            }

            ///TODO: Step 3: Check fields authenticity exists in validate model
            const isAuthenticityFieldsExists = validateFieldsAuthenticity(queryParamsKeys, validateModelName);
            logInfo(`isAuthenticityFieldsExists: ${stringify(isAuthenticityFieldsExists)}`, fileDetails, true);

            if (!isAuthenticityFieldsExists.isValid || isAuthenticityFieldsExists.error) {
                throw new Error(isAuthenticityFieldsExists.error);
            }

            ///TODO: Step 4: Get query params values
            const queryParamsValues = Object.values(queryParams);
            // logInfo(`queryParamsValues: ${stringify(queryParamsValues)}`, fileDetails, true);

            ///TODO: Step 5: Check values contains filter format, only string or object
            const isValidateValuesContainsFilterFormat =
                LogicCheckUtil.validateValuesContainsFilterFormat(queryParamsValues);
            logInfo(
                `isValidateValuesContainsFilterFormat: ${stringify(isValidateValuesContainsFilterFormat)}`,
                fileDetails,
                true
            );

            if (!isValidateValuesContainsFilterFormat.isValid || isValidateValuesContainsFilterFormat.error) {
                throw new Error(isValidateValuesContainsFilterFormat.error);
            }
            result.isValid = true;
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Validate entity params with validate model
    validateEntityParams: (entity, validateModelName) => {
        const fileDetails = `[${filenameWithoutPath}] [validateQueryParams]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!entity) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }

            if (!validateModelName) {
                throw new Error('Invalid validate model name, please provide validate model name');
            }

            ///TODO: Step 1: Get query params keys
            const queryParamsKeys = Object.keys(entity);
            logInfo(`queryParamsKeys: ${stringify(queryParamsKeys)}`, fileDetails, true);

            ///TODO: Step 2: Check any field exists
            const isAnyFieldExists = LogicCheckUtil.checkAnyFieldExists(queryParamsKeys);
            logInfo(`isAnyFieldExists: ${stringify(isAnyFieldExists)}`, fileDetails, true);

            if (!isAnyFieldExists.isValid || isAnyFieldExists.error) {
                throw new Error(isAnyFieldExists.error);
            }

            ///TODO: Step 3: Check fields authenticity exists in validate model
            const isAuthenticityFieldsExists = validateFieldsAuthenticity(queryParamsKeys, validateModelName);
            logInfo(`isAuthenticityFieldsExists: ${stringify(isAuthenticityFieldsExists)}`, fileDetails, true);

            if (!isAuthenticityFieldsExists.isValid || isAuthenticityFieldsExists.error) {
                throw new Error(isAuthenticityFieldsExists.error);
            }

            // const validateModelFieldsResult = validateModelFields(entity, validateModelName);

            // if (!validateModelFieldsResult.isValid || validateModelFieldsResult.error) {
            //     logInfo(`validateModelFieldsResult: ${stringify(validateModelFieldsResult)}`, fileDetails, true);
            //     // throw new Error(validateModelFieldsResult.error);
            //     throw new Error(validateModelFieldsResult.error || 'Invalid entity params');
            // }

            // logInfo(`validateModelFieldsResult: ${stringify(validateModelFieldsResult)}`, fileDetails, true);
            result.isValid = true;
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Validate entities params with validate model
    validateEntitiesParams: (entities, validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}] [validateQueryParams]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!entities) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }

            if (!Array.isArray(entities) || entities.length === 0) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }

            if (!validateModelName) {
                throw new Error('Invalid validate model name, please provide validate model name');
            }

            ///TODO: Step 1: Validate each entity params with validate model
            for (const entity of entities) {
                const isValidateEntityParams = LogicCheckUtil.validateEntityParams(entity, validateModelName);
                if (!isValidateEntityParams.isValid || isValidateEntityParams.error) {
                    throw new Error(isValidateEntityParams.error);
                }
            }
            result.isValid = true;
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Convert query params to mongo query
    convertQueryParamsToMongoQuery: async (queryParams, validateModelName) => {
        const fileDetails = `[${filenameWithoutPath}] [convertQueryParamsToMongoQuery]`;
        let result = {
            query: {},
            error: null,
        };
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

            ///TODO: Step 1: Check each query params key and value
            for (const [key, value] of queryParamsEntries) {
                logInfo(`key: ${stringify(key)}`, fileDetails, true);
                logInfo(`value: ${stringify(value)}`, fileDetails, true);
                newValue = String(value).split(',');

                ///TODO: Step 1.1: Check each query params key and value, if key is roles, then search roles by name
                logInfo(`newValue: ${stringify(newValue)}`, fileDetails, true);

                if (key === 'category' && validateModelName === 'Todo') {
                    const searchCategoryIdByNameResult = await LogicCheckUtil.searchCategoryIdByName(newValue);
                    const searchCategoriesId = searchCategoryIdByNameResult.map((category) => category._id);
                    result.query['category'] = { $in: searchCategoriesId };
                } else if (key === 'status' && validateModelName === 'Todo') {
                    const searchStatusIdByNameResult = await LogicCheckUtil.searchStatusIdByName(newValue);
                    const searchStatusesId = searchStatusIdByNameResult.map((status) => status._id);
                    result.query['status'] = { $in: searchStatusesId };
                } else if (key === 'user' && validateModelName === 'Todo') {
                    let searchUsersId = [];
                    let isAllObjectId = false;

                    if (newValue.length > 1) {
                        isAllObjectId = newValue.every((currVal) => validObjectId(currVal));
                        const isPastObjectId = newValue.some((currVal) => validObjectId(currVal));

                        if (isPastObjectId && !isAllObjectId) {
                            throw new Error('The query value must all object id or all username string.');
                        }

                        if (!isAllObjectId) {
                            const searchUserIdByNameResult = await LogicCheckUtil.searchUserIdByName(newValue);
                            logInfo(`searchUserIdByNameResult: ${searchUserIdByNameResult}`, fileDetails, true);
                            searchUsersId = searchUserIdByNameResult.map((user) => user._id);
                        } else {
                            searchUsersId = newValue.map((val) => toObjectId(val));
                        }
                    } else {
                        isAllObjectId = validObjectId(newValue[0]);

                        if (!isAllObjectId) {
                            const searchUserIdByNameResult = await LogicCheckUtil.searchUserIdByName(newValue);
                            logInfo(`searchUserIdByNameResult: ${searchUserIdByNameResult}`, fileDetails, true);
                            searchUsersId = searchUserIdByNameResult.map((user) => user._id);
                        } else {
                            searchUsersId.push(toObjectId(newValue[0]));
                        }
                    }
                    logInfo(
                        `The ${newValue} whether object id or not ? ${isAllObjectId}, searchUsersId: ${stringify(
                            searchUsersId
                        )}`,
                        fileDetails
                    );
                    result.query['user'] = { $in: searchUsersId };
                } else {
                    if (key === 'roles') {
                        const searchRolesByNameResult = await LogicCheckUtil.searchRolesByName(newValue);
                        const searchRolesIds = searchRolesByNameResult.map((role) => role._id);
                        newValue = searchRolesIds;
                    }
                    ///TODO: Step 1.2: Add newValue to query with $in operator
                    result.query[key] = { $in: newValue };
                }
            }
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Get filter query
    getFilterQuery: async (queryParams, validateModelName) => {
        const fileDetails = `[${filenameWithoutPath}] [getFilterQuery]`;
        let result = {
            query: {},
            error: null,
        };
        try {
            if (!queryParams) {
                throw new Error('Invalid query parameters, please provide query parameters');
            }
            if (!validateModelName) {
                throw new Error('Invalid validate model name, please provide validate model name');
            }

            ///TODO: Step 1: Validate query params, if valid then enter to next step else throw error message
            const validateQueryParamsResult = LogicCheckUtil.validateQueryParams(queryParams, validateModelName);

            logInfo(`validateQueryParamsResult: ${stringify(validateQueryParamsResult)}`, fileDetails, true);

            if (!validateQueryParamsResult.isValid || validateQueryParamsResult.error) {
                throw new Error(validateQueryParamsResult.error);
            }

            ///TODO: Step 2: Convert query params to mongo query
            result = await LogicCheckUtil.convertQueryParamsToMongoQuery(queryParams, validateModelName);

            if (!result.query || Object.keys(result.query).length === 0 || result.query.length === 0 || result.error) {
                throw new Error(result.error);
            }
            // logInfo(`getFilterQuery result: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Check duplicate value existing, filter condition with $or operator, return filter query
    checkDuplicateExisting: async (entity, validateModelName, validateOperating) => {
        // const fileDetails = `[${filenameWithoutPath}] [checkDuplicateExisting]`;
        let filterQuery = {};

        try {
            ///TODO: Step 1.1: Check entity, if not exists then throw error message
            if (!entity || Object.keys(entity).length === 0) {
                throw new Error('Invalid entity');
            }

            ///TODO: Step 1.2: Check validate model name, if not exists then throw error message
            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            ///TODO: Step 1.3: Check validate operating, if not exists then throw error message
            if (!validateOperating) {
                throw new Error('Invalid validate operating');
            }

            if (validateOperating === 'update' && !entity._id) {
                throw new Error('Invalid entity id');
            }

            ///TODO: Step 2: Get allowed fields from validate model, if not exists then throw error message
            let allowedFields = [];

            ///TODO: Step 2.1: Check validate operating, if not exists then throw error message
            ///TODO: Step 2.2: Check allowed fields, if not exists then throw error message
            if (validateOperating === 'create') {
                filterQuery = {
                    $or: [],
                };
                allowedFields = fieldValidation[validateModelName]['checkDuplicate'];
                if (!allowedFields || allowedFields.length === 0) {
                    throw new Error('Invalid validate model name');
                }
                ///TODO: Step 3: Check each allowed fields, if exists then add to filter query
                allowedFields.forEach((field) => {
                    // logInfo(`Current check field: ${stringify(field)}`, fileDetails, true);
                    if (entity[field]) {
                        filterQuery.$or.push({
                            [field]: entity[field],
                        });
                    }
                });
            } else if (validateOperating === 'update') {
                filterQuery = {
                    $and: [
                        {
                            $or: [],
                        },
                        {
                            _id: { $ne: entity._id },
                        },
                    ],
                };
                allowedFields = fieldValidation[validateModelName]['checkDuplicate'];
                if (!allowedFields || allowedFields.length === 0) {
                    throw new Error('Invalid validate model name');
                }
                ///TODO: Step 3: Check each allowed fields, if exists then add to filter query
                allowedFields.forEach((field) => {
                    // logInfo(`Current check field: ${stringify(field)}`, fileDetails, true);
                    if (entity[field]) {
                        filterQuery.$and[0].$or.push({ [field]: { $in: [entity[field]] } });
                    }
                });
            } else {
                throw new Error('Invalid validate operating');
            }
            return filterQuery;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Check multiple duplicate existing, filter condition with $or operator, return filter query
    checkMultipleDuplicateExisting: async (entities, validateModelName, validateOperating) => {
        const fileDetails = `[${filenameWithoutPath}] [checkMultipleDuplicateExisting]`;
        let filterQuery = {};

        try {
            ///TODO: Step 1.1: Check entities, if not exists then throw error message
            if (!entities || entities.length === 0 || !Array.isArray(entities)) {
                throw new Error('Invalid entities');
            }

            ///TODO: Step 1.2: Check validate model name, if not exists then throw error message
            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            ///TODO: Step 1.3: Check validate operating, if not exists then throw error message
            if (!validateOperating) {
                throw new Error('Invalid validate operating');
            }

            if (validateOperating === 'update' && !entity._id) {
                throw new Error('Invalid entity id');
            }

            ///TODO: Step 2: Get allowed fields from validate model, if not exists then throw error message
            let allowedFields = [];

            if (validateOperating === 'create') {
                filterQuery = {
                    $or: [],
                };
                allowedFields = fieldValidation[validateModelName]['checkDuplicate'];
                if (!allowedFields || allowedFields.length === 0) {
                    throw new Error('Invalid entity id');
                }
                ///TODO: Step 3: Check each allowed fields, if exists then add to filter query
                entities.forEach((entity) => {
                    allowedFields.forEach((field) => {
                        if (entity[field]) {
                            ///TODO: Step 3.1: Check filter query $and[0].$or, if not exists then add to filter query
                            const filterQueryField = filterQuery.$or.find((filter) => filter[field]);

                            if (!filterQueryField) {
                                filterQuery.$or.push({ [field]: { $in: [entity[field]] } });
                            } else {
                                filterQueryField[field].$in = [...filterQueryField[field].$in, entity[field]];
                            }
                        }
                    });
                });
            } else if (validateOperating === 'update') {
                filterQuery = {
                    $and: [
                        {
                            $or: [],
                        },
                        {
                            _id: { $ne: entity._id },
                        },
                    ],
                };
                allowedFields = fieldValidation[validateModelName]['checkDuplicate'];
                if (!allowedFields || allowedFields.length === 0) {
                    throw new Error('Invalid entity id');
                }
                ///TODO: Step 3: Check each allowed fields, if exists then add to filter query
                entities.forEach((entity) => {
                    allowedFields.forEach((field) => {
                        if (entity[field]) {
                            ///TODO: Step 3.1: Check filter query $and[0].$or, if not exists then add to filter query
                            const filterQueryField = filterQuery.$and[0].$or.find((filter) => filter[field]);

                            if (!filterQueryField) {
                                filterQuery.$and[0].$or.push({ [field]: { $in: [entity[field]] } });
                            } else {
                                filterQueryField[field].$in = [...filterQueryField[field].$in, entity[field]];
                            }
                        }
                    });
                });
            } else {
                throw new Error('Invalid validate operating');
            }
            return filterQuery;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Set one and update fields, return update query
    setOneAndUpdateFields: (entity, validateModelName, validateOperating) => {
        // const fileDetails = `[${filenameWithoutPath}] [setOneAndUpdateFields]`;
        const fields = {};

        try {
            ///TODO: Step 1: Check entity, if not exists then throw error message
            if (!entity || Object.keys(entity).length === 0) {
                throw new Error('Invalid entity');
            }

            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            ///TODO: Step 2: Get allowed fields from validate model, if not exists then throw error message
            let allowedFields = [];

            if (validateOperating === 'create') {
                allowedFields = fieldValidation[validateModelName]['create'];
            } else if (validateOperating === 'update') {
                allowedFields = fieldValidation[validateModelName]['update'];
            } else {
                throw new Error('Invalid validate operating');
            }
            // logInfo(`allowedFields: ${stringify(allowedFields)}`, fileDetails, true);
            if (!allowedFields || allowedFields.length === 0) {
                throw new Error('Invalid allowed fields');
            }

            ///TODO: Step 3: Check each allowed fields, if exists then add to fields
            ///TODO: Method 1
            Object.keys(entity).forEach((key) => {
                if (allowedFields.includes(key)) {
                    fields[key] = entity[key];
                }
            });

            ///TODO: Method 2
            // allowedFields.forEach((field) => {
            //     if (entity[field]) {
            //         fields[field] = entity[field];
            //     }
            // });
        } catch (error) {
            // logError(error, fileDetails, true);
        }
        return fields;
    },
};

module.exports = LogicCheckUtil;
