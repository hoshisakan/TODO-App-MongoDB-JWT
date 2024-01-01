const { logError, logInfo } = require('../utils/log.util.js');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util.js');
const { validateFieldsAuthenticity } = require('../utils/model.validate.util');
const { fieldValidation } = require('../utils/validate.util.js').crudOperations;

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();

const LogicCheckUtil = {
    checkAnyFieldExists: (queryParamsKeys = []) => {
        return queryParamsKeys.length > 0
            ? { isValid: true, error: null }
            : { isValid: false, error: 'No query parameters found' };
    },
    ///TODO: Search roles by name
    searchRolesByName: async (roles = []) => {
        const fileDetails = `[${filenameWithoutPath}] [searchRolesByName]`;
        let result = [];
        try {
            result = await unitOfWork.roles.find({ name: { $in: roles } });
            // logInfo(`searchRolesByName result: ${stringify(result)}`, fileDetails, true);
            if (!result) {
                throw new Error('Search roles by name list failed, please provide correct roles list');
            }
            return result;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    validateValuesContainsFilterFormat: (queryParamsValues = []) => {
        const fileDetails = `[${filenameWithoutPath}] [validateValuesContainsFilterFormat]`;
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
    regexCheckIncludeSpecialCharacters: (value) => {
        if (!value) {
            throw new Error('Value is required');
        }
        const regex = /[,|]+/;
        return regex.test(value);
    },
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

            const queryParamsKeys = Object.keys(queryParams);
            logInfo(`queryParamsKeys: ${stringify(queryParamsKeys)}`, fileDetails, true);

            const isAnyFieldExists = LogicCheckUtil.checkAnyFieldExists(queryParamsKeys);
            logInfo(`isAnyFieldExists: ${stringify(isAnyFieldExists)}`, fileDetails, true);

            if (!isAnyFieldExists.isValid || isAnyFieldExists.error) {
                throw new Error(isAnyFieldExists.error);
            }
            const isAuthenticityFieldsExists = validateFieldsAuthenticity(queryParamsKeys, validateModelName);
            logInfo(`isAuthenticityFieldsExists: ${stringify(isAuthenticityFieldsExists)}`, fileDetails, true);

            if (!isAuthenticityFieldsExists.isValid || isAuthenticityFieldsExists.error) {
                throw new Error(isAuthenticityFieldsExists.error);
            }

            const queryParamsValues = Object.values(queryParams);
            // logInfo(`queryParamsValues: ${stringify(queryParamsValues)}`, fileDetails, true);

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

            const queryParamsKeys = Object.keys(entity);
            logInfo(`queryParamsKeys: ${stringify(queryParamsKeys)}`, fileDetails, true);

            const isAnyFieldExists = LogicCheckUtil.checkAnyFieldExists(queryParamsKeys);
            logInfo(`isAnyFieldExists: ${stringify(isAnyFieldExists)}`, fileDetails, true);

            if (!isAnyFieldExists.isValid || isAnyFieldExists.error) {
                throw new Error(isAnyFieldExists.error);
            }
            const isAuthenticityFieldsExists = validateFieldsAuthenticity(queryParamsKeys, validateModelName);
            logInfo(`isAuthenticityFieldsExists: ${stringify(isAuthenticityFieldsExists)}`, fileDetails, true);

            if (!isAuthenticityFieldsExists.isValid || isAuthenticityFieldsExists.error) {
                throw new Error(isAuthenticityFieldsExists.error);
            }
            result.isValid = true;
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
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
    convertQueryParamsToMongoQuery: async (queryParams) => {
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

            for (const [key, value] of queryParamsEntries) {
                logInfo(`key: ${stringify(key)}`, fileDetails, true);
                logInfo(`value: ${stringify(value)}`, fileDetails, true);
                newValue = String(value).split(',');

                if (key === 'roles') {
                    const searchRolesByNameResult = await LogicCheckUtil.searchRolesByName(newValue);
                    logInfo(`searchRolesByNameResult: ${stringify(searchRolesByNameResult)}`, fileDetails, true);
                    const searchRolesIds = searchRolesByNameResult.map((role) => role._id);
                    newValue = searchRolesIds;
                }
                logInfo(`newValue: ${stringify(newValue)}`, fileDetails, true);
                result.query[key] = { $in: newValue };
            }
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
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
            const validateQueryParamsResult = LogicCheckUtil.validateQueryParams(queryParams, validateModelName);

            logInfo(`validateQueryParamsResult: ${stringify(validateQueryParamsResult)}`, fileDetails, true);

            if (!validateQueryParamsResult.isValid || validateQueryParamsResult.error) {
                throw new Error(validateQueryParamsResult.error);
            }

            result = await LogicCheckUtil.convertQueryParamsToMongoQuery(queryParams);
            if (!result.query || Object.keys(result.query).length === 0 || result.query.length === 0 || result.error) {
                throw new Error(result.error);
            }
            logInfo(`getFilterQuery result: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            result.error = err.message;
            // logError(err, fileDetails, true);
        }
        return result;
    },
    ///TODO: Check duplicate existing todo category, return filter query
    checkDuplicateExisting: async (entity, validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}] [checkDuplicateExisting]`;
        let filterQuery = {};

        try {
            if (!entity || Object.keys(entity).length === 0) {
                throw new Error('Invalid entity');
            }

            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            filterQuery = {
                $or: [],
            };

            const allowedFields = fieldValidation[validateModelName]['createOrUpdate']

            // logInfo(`allowedFields: ${stringify(allowedFields)}`, fileDetails, true);

            if (!allowedFields || allowedFields.length === 0 || !Array.isArray(allowedFields)) {
                throw new Error('Invalid allowed fields');
            }

            allowedFields.forEach((field) => {
                // logInfo(`Current check field: ${stringify(field)}`, fileDetails, true);
                if (entity[field]) {
                    filterQuery.$or.push({ [field]: entity[field] });
                }
            });
            return filterQuery;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Check multiple duplicate existing todo category, return filter query
    checkMultipleDuplicateExisting: async (entities, validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}] [checkMultipleDuplicateExisting]`;
        let filterQuery = {};

        try {
            if (!entities || entities.length === 0 || !Array.isArray(entities)) {
                throw new Error('Invalid entities');
            }

            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            filterQuery = {
                $or: [],
            };

            const allowedFields = fieldValidation[validateModelName]['createOrUpdate']

            if (!allowedFields || allowedFields.length === 0 || !Array.isArray(allowedFields)) {
                throw new Error('Invalid allowed fields');
            }

            // logInfo(`allowedFields: ${stringify(allowedFields)}`, fileDetails, true);

            entities.forEach((entity) => {
                allowedFields.forEach((field) => {
                    if (entity[field]) {
                        const filterQueryField = filterQuery.$or.find((filter) => filter[field]);

                        if (!filterQueryField) {
                            filterQuery.$or.push({ [field]: { $in: [entity[field]] } });
                        } else {
                            filterQueryField[field].$in = [...filterQueryField[field].$in, entity[field]];
                        }
                    }
                });
            });

            return filterQuery;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    },
    ///TODO: Set one and update fields, return update query
    setOneAndUpdateFields: (entity, validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}] [setOneAndUpdateFields]`;
        const fields = {};

        try {
            if (!entity || Object.keys(entity).length === 0) {
                throw new Error('Invalid entity');
            }

            if (!validateModelName || !fieldValidation[validateModelName]) {
                throw new Error('Invalid validate model name');
            }

            const allowedFields = fieldValidation[validateModelName]['createOrUpdate']

            if (!allowedFields || allowedFields.length === 0 || !Array.isArray(allowedFields)) {
                throw new Error('Invalid allowed fields');
            }

            // logInfo(`allowedFields: ${stringify(allowedFields)}`, fileDetails, true);

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
            return fields;
        } catch (error) {
            // logError(error, fileDetails, true);
        }
        return fields;
    },
};

module.exports = LogicCheckUtil;
