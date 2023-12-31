const { logError, logInfo } = require('../utils/log.util.js');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util.js');
const { validateFieldsAuthenticity } = require('../utils/model.validate.util');

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
            logError(error, fileDetails, true);
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
            logError(err, fileDetails, true);
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
            logError(err, fileDetails, true);
        }
        return result;
    },
    convertQueryParamsToMongoQuery: async (queryParams) => {
        let result = {
            query: {},
            error: null,
        };
        let newValue = [];
        const fileDetails = `[${filenameWithoutPath}] [convertQueryParamsToMongoQuery]`;
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
            logError(err, fileDetails, true);
        }
        return result;
    },
    getFilterQuery: async (queryParams, validateModelName) => {
        let result = {
            query: {},
            error: null,
        };
        const fileDetails = `[${filenameWithoutPath}] [getFilterQuery]`;
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
                throw new Error(
                    validateQueryParamsResult.error
                );
            }

            result = await LogicCheckUtil.convertQueryParamsToMongoQuery(queryParams);
            if (!result.query || Object.keys(result.query).length === 0 || result.query.length === 0 || result.error) {
                throw new Error(result.error);
            }
            logInfo(`getFilterQuery result: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            result.error = err.message;
            logError(err, fileDetails, true);
        }
        return result;
    },
};

module.exports = LogicCheckUtil;
