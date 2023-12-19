const { log } = require('../utils/debug.util');
const { stringify } = require('../utils/json.util');
const { endpoint } = require('../utils/validate.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();
const validateFields = endpoint.roleEndpoint.validateFields;


class RoleService extends BaseService {
    constructor() {
        super(unitOfWork.roles);
        this.unitOfWork = unitOfWork;
    }

    ///TODO: Get expression of multiple fields by query params and check fields
    handleMultQueryParams = async (queryParams) => {
        let expression = {};
        const checkFields = Object.keys(queryParams);

        if (checkFields.length === 1) {
            expression = await this.handleSingleQueryParams(queryParams, checkFields[0]);
        } else {
            ///TODO: If fields different quantity, then will be use 'OR' operator search in database
            const validateResult = validateFields.every((field) => checkFields.includes(field));
            log(`validateResult: ${validateResult}`, true);
            expression = validateResult ? { $or: [] } : {};

            for (const checkField of checkFields) {
                if (validateResult) {
                    ///TODO: If validateResult is true, then will be use 'OR' operator search in database
                    expression.$or.push(await this.handleSingleQueryParams(queryParams, checkField));
                } else {
                    ///TODO: If validateResult is false, then will be use 'AND' operator search in database
                    expression = Object.assign(expression, await this.handleSingleQueryParams(queryParams, checkField));
                }
            }
            log(`expression: ${stringify(expression)}`, true);
        }
        return expression;
    };

    ///TODO: Get expression of one fields by query params and check field
    handleSingleQueryParams = async (queryParams, checkField) => {
        let expression = {};
        ///TODO: If not add $or operator, then will be use 'AND' operator search in database
        if (queryParams.id && checkField === 'id') {
            // expression._id = queryParams.id;
            expression._id = {
                $in: queryParams.id.split(','),
            };
        } else if (queryParams.name && checkField === 'name') {
            // expression.name = queryParams.name;
            expression.name = {
                $in: queryParams.name.split(','),
            };
        }
        return expression;
    };

    ///TODO: Check query params is valid, allMatch is true then must all fields match with validateFields fields, otherwise return false
    checkQueryParams = (queryParams, allMatch) => {
        let checkFields = Object.keys(queryParams);
        const checkFieldsCount = checkFields.length;
        // log(`checkFields: ${checkFieldsCount}`, true);
        // log(`validateFields: ${stringify(validateFields)}`, true);
        let result = false;

        if (checkFieldsCount == 1) {
            result = validateFields.includes(checkFields[0]) ? true : false;
        } else if (checkFieldsCount > 1 && allMatch) {
            ///TODO: Check query params is valid, every method equal to C# LINQ All method
            ///TODO: must all fields match with validateFields fields, otherwise return false
            result = validateFields.every((field) => checkFields.includes(field)) ? true : false;
        } else if (checkFieldsCount > 1 && !allMatch) {
            result = validateFields.some((field) => checkFields.includes(field)) ? true : false;
        }
        return result;
    };

    isOnlyOneValueExists = (queryParams) => {
        const chechValues = Object.values(queryParams);
        log(`chechValues: ${stringify(chechValues)}`, true);

        let callbackFn = null;
        let result = false;

        // callbackFn = (value) => !Array.isArray(value);
        ///TODO: Method1: filter items of not equal to array, then check length whether equal to chechValues length
        //result = chechValues.filter(callbackFn).length === chechValues.length;

        callbackFn = (value) => Array.isArray(value);
        ///TODO: Method2: filter items of equal to array, then check length whether equal to 0
        // result = chechValues.filter(callbackFn).length === 0;

        ///TODO: Method3: check every item whether not equal to array, all items not equal to array then return true, otherwise return false
        callbackFn = (value) => !Array.isArray(value);
        result = chechValues.every(callbackFn);

        log(`result: ${result}`, true);
        return result;
    };

    ///TODO: Find all roles by query params
    find = async (queryParams) => {
        const checkFields = Object.keys(queryParams);
        const checkFieldsCount = checkFields.length;

        log(`checkFields: ${stringify(checkFields)}, attributes count: ${checkFieldsCount}`, true);

        if (checkFieldsCount > 0) {
            const isOnlyOneValueExists = this.isOnlyOneValueExists(queryParams);

            log(`isOnlyOneValueExists: ${isOnlyOneValueExists}`, true);

            if (!isOnlyOneValueExists) {
                throw new Error('Query params is not valid, every field only allowed exists one value');
            }
            if (this.checkQueryParams(queryParams)) {
                // log(`queryParams: ${stringify(queryParams)}`, true);

                let expression = {};
                expression = await this.handleMultQueryParams(queryParams);
                // log(`expression: ${stringify(expression)}`, true);

                return await this.unitOfWork.roles.find(expression);
            } else {
                log(`Query params is reuquired, not pass query parameter check`, true);
                throw new Error('Query params is reuquired');
            }
        }
        return await this.unitOfWork.roles.find();
    };
}

module.exports = RoleService;
