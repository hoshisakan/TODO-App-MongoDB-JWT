const { logInfo, logError } = require('../utils/log.util');
const { stringify } = require('../utils/json.util');
const { endpoint, queryOperator } = require('../utils/validate.util');
const { filenameFilter } = require('../utils/regex.util');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();
const findValidateFields = endpoint.userEndpoint.findValidateFields;
const signUpValidateFields = endpoint.userEndpoint.signUpValidateFields;
const validateMode = endpoint.userEndpoint.validateMode;
const validateOperators = queryOperator.validateOperators;
const mongoOperators = queryOperator.mongoOperators;

class UserService extends BaseService {
    constructor() {
        super(unitOfWork.users);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
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

    ///TODO: Search roles by name
    searchRolesByName = async (roles) => {
        return await this.unitOfWork.roles.find({ name: { $in: roles } });
    };

    getValidateFields = (validObj) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let validateFields = [];

        try {
            if (!validObj) {
                throw new Error('Valid object is required');
            }
            switch (validObj) {
                case 'find':
                    validateFields = findValidateFields;
                    break;
                case 'signup':
                    validateFields = signUpValidateFields;
                    break;
                default:
                    throw new Error('Valid object is invalid');
            }
        } catch (error) {
            logError(error, fileDetails, true);
        }
        return validateFields;
    };

    isAnyFieldExists = (queryParams, validObj, reverse) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        const checkFields = Object.keys(queryParams);
        // const checkFieldsCount = checkFields.length;
        let validateFields = [];
        logInfo(`checkFields: ${stringify(checkFields)}`, fileDetails, true);

        if (!queryParams) {
            throw new Error('Query params is required');
        }
        if (!validObj) {
            throw new Error('Validate object is required');
        }
        validateFields = this.getValidateFields(validObj);
        return reverse
            ? checkFields.some((field) => !validateFields.includes(field))
            : checkFields.some((field) => validateFields.includes(field));
    };

    isAllFieldsExists = (queryParams, validObj, reverse) => {
        const checkFields = Object.keys(queryParams);
        // const checkFieldsCount = checkFields.length;
        let validateFields = [];
        logInfo(`checkFields: ${stringify(checkFields)}`, true);

        if (!queryParams) {
            throw new Error('Query params is required');
        }
        if (!validObj) {
            throw new Error('Validate object is required');
        }
        validateFields = this.getValidateFields(validObj);
        return reverse
            ? checkFields.every((field) => !validateFields.includes(field))
            : checkFields.every((field) => validateFields.includes(field));
    };

    validateQueryOperator = (queryOperator) => {
        return validateOperators.indexOf(queryOperator) === -1 ? false : true;
    };

    getQueryOperator = (queryOperator) => {
        return this.validateQueryOperator(queryOperator) ? mongoOperators[queryOperator] : null;
    };

    isArray = (value) => {
        return Array.isArray(value);
    };

    convertToArray = (value) => {
        if (!value) {
            throw new Error('Value is required');
        }
        return this.isArray(value) ? value : String(value).split(',');
    };

    getValueOfAttributeCount = (attribute) => {
        if (!attribute) {
            throw new Error('Query param is required');
        }
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        const checkValues = Object.values(attribute);
        const checkValuesCount = checkValues.length;

        logInfo(`checkValues: ${stringify(checkValues)}, attributes count: ${checkValuesCount}`, fileDetails, true);

        return checkValuesCount;
    };

    regexCheckIncludeSpecialCharacters = (value) => {
        if (!value) {
            throw new Error('Value is required');
        }
        // const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        const regex = /[,|]+/;
        return regex.test(value);
    };

    isMultValues = (attribute) => {
        return this.isArray(attribute) || this.regexCheckIncludeSpecialCharacters(attribute);
    };

    isOnlyOneValueExists = (queryParams) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        if (!queryParams) {
            throw new Error('Query params is required');
        }
        const checkValues = Object.values(queryParams);

        logInfo(`checkValues: ${stringify(checkValues)}`, fileDetails, true);

        let callbackFn = null;
        let result = false;

        // callbackFn = (value) => !Array.isArray(value);
        ///TODO: Method1: filter items of not equal to array, then check length whether equal to chechValues length
        //result = checkValues.filter(callbackFn).length === chechValues.length;

        // callbackFn = (value) => Array.isArray(value);
        ///TODO: Method2: filter items of equal to array, then check length whether equal to 0
        // result = checkValues.filter(callbackFn).length === 0;

        ///TODO: Method3: check every item whether not equal to array, all items not equal to array then return true, otherwise return false
        callbackFn = (value) => !Array.isArray(value);
        result = checkValues.every(callbackFn);

        logInfo(`result: ${result}`, fileDetails, true);
        return result;
    };

    validateRequestMode = (reqValidateMode) => {
        if (!reqValidateMode) {
            throw new Error('Validate mode is required');
        }
        return validateMode.indexOf(reqValidateMode) === -1 ? false : true;
    };

    ///TODO: Get single field expression, 目前在處理 isEnableQueryOperator 與 queryOperator 時有問題，原因待查，進而影響到 getMultFieldsExpression 方法
    getSingleFieldExpression = async (queryParams, queryOperator, checkField, isEnableQueryOperator) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let expression = {};

        try {
            // logInfo(`checkValues: ${stringify(checkValues)}, attributes count: ${checkValuesCount}`, fileDetails, true);

            if (!queryParams) {
                throw new Error('Query params is required');
            }

            if (!queryOperator) {
                throw new Error('Query operator is required');
            }

            if (!checkField) {
                throw new Error('Check field is required');
            }

            let value = null;
            let mongoOperator = null;

            logInfo(`isEnableQueryOperator: ${isEnableQueryOperator}`, fileDetails, true);

            mongoOperator = isEnableQueryOperator ? this.getQueryOperator(queryOperator) : null;

            if (mongoOperator) {
                logInfo(`mongoOperator: ${stringify(mongoOperator)}`, fileDetails, true);
                expression = { queryOperator: [expression] };
            } else {
                logInfo(`Disable mongodb query expression, status: ${isEnableQueryOperator}`, fileDetails, true);
            }

            if (checkField === 'id') {
                value = queryParams.id;
                expression = this.isMultValues(value) ? { _id: { $in: this.convertToArray(value) } } : { _id: value };
                logInfo(`Add id field related to expression: ${stringify(expression)}`, fileDetails, true);
            } else if (checkField === 'email') {
                value = queryParams.email;
                expression = this.isMultValues(value)
                    ? { email: { $in: this.convertToArray(value) } }
                    : { email: value };
                logInfo(`Add email field related to expression: ${stringify(expression)}`, fileDetails, true);
            } else if (checkField === 'username') {
                value = queryParams.username;
                expression = this.isMultValues(value)
                    ? { username: { $in: this.convertToArray(value) } }
                    : { username: value };
                logInfo(`Add username field related to expression: ${stringify(expression)}`, fileDetails, true);
            } else if (checkField === 'roles') {
                value = queryParams.roles;
                expression = this.isMultValues(value)
                    ? { roles: { $in: this.convertToArray(value) } }
                    : { roles: value };
                logInfo(`Add roles field related to expression: ${stringify(expression)}`, fileDetails, true);
            } else {
                logInfo(
                    `Check field ${checkField} is invalid, must be id, email, username or roles`,
                    fileDetails,
                    true
                );
                throw new Error(`Check field ${checkField} is invalid, must be id, email, username or roles`);
            }
            logInfo(`getSingleFieldExpression handle query expression: ${stringify(expression)}`, fileDetails, true);
        } catch (err) {
            expression = null;
            logError(err, fileDetails, true);
        }
        return expression;
    };

    getMultFieldsExpression = async (queryParams, queryOperator) => {
        let expression = {};
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!queryParams) {
                throw new Error('Query params is required');
            }

            if (!queryOperator) {
                throw new Error('Query operator is required');
            }

            const checkFields = Object.keys(queryParams);
            const checkFieldsCount = checkFields.length;

            logInfo(`checkFields: ${stringify(checkFields)}, attributes count: ${checkFieldsCount}`, fileDetails, true);

            if (checkFieldsCount < 2) {
                throw new Error('Query params is invalid, must be more than one field');
            }

            let mongodbQueryOperator = null;

            mongodbQueryOperator = this.getQueryOperator(queryOperator);

            if (!mongodbQueryOperator) {
                throw new Error('Convert mongodb query operator failed, query operator is invalid');
            }

            logInfo(
                `getMultFieldsExpression mongodbQueryOperator: ${stringify(mongodbQueryOperator)}`,
                fileDetails,
                true
            );

            expression[mongodbQueryOperator] = [];

            checkFields.forEach(async (field, index) => {
                // logInfo(`index: ${index + 1}, field: ${field}`, true);
                const currFieldExpression = await this.getSingleFieldExpression(
                    queryParams,
                    queryOperator,
                    field,
                    false
                );
                logInfo(
                    `current field '${field}' get expression: ${stringify(currFieldExpression)}`,
                    fileDetails,
                    true
                );
                if (!currFieldExpression || Object.keys(currFieldExpression).length === 0) {
                    throw new Error(`Get single field expression failed, field: ${field}`);
                }
                // await expression[mongodbQueryOperator].push(currFieldExpression);
                expression[mongodbQueryOperator] = [...expression[mongodbQueryOperator], currFieldExpression];
            });
        } catch (err) {
            expression = null;
            logError(err, fileDetails, true);
        }
        return expression;
    };

    ///TODO: Find one user by query params
    findOne = async (expression={}) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = [];

        result = await this.unitOfWork.users.findOne(expression);
        return result;
    };

    ///TODO: Find all users by query params
    find = async (expression={}) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = [];
        result = await this.unitOfWork.users.find(expression);
        return result;
    };
}

module.exports = UserService;
