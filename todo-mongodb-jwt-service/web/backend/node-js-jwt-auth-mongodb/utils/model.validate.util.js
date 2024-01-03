const User = require('../models/mongodb/user.model');
const Role = require('../models/mongodb/role.model');
const TodoCategory = require('../models/mongodb/todo.category.model');
const Todo = require('../models/mongodb/todo.model');
const { logInfo, logError } = require('./log.util');

const { filenameFilter } = require('./regex.util');
const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const ModelValidateUtil = {
    validateModelFields: async (entity, validateModelName) => {
        const fileDetails = `[${filenameWithoutPath}] [validateModelFields]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!entity) {
                throw new Error('Invalid entity, please provide entity');
            }

            if (!validateModelName) {
                throw new Error('Invalid validate model name, please provide validate model name');
            }

            const validateFieldsResult = null;

            switch (validateModelName) {
                case 'User':
                    validateFieldsResult = await User.validate(entity);
                    break;
                case 'Role':
                    validateFieldsResult = await Role.validate(entity);
                    break;
                case 'TodoCategory':
                    validateFieldsResult = await TodoCategory.validate(entity);
                    break;
                case 'Todo':
                    validateFieldsResult = await Todo.validate(entity);
                    break;
                default:
                    throw new Error(`Invalid validate model name: ${validateModelName}`);
            }

            logInfo(`[validateFieldsResult]: ${JSON.stringify(validateFieldsResult)}`, fileDetails);

            if (validateFieldsResult && validateFieldsResult.error) {
                throw new Error(validateFieldsResult.error);
            }
            result.isValid = true;
        } catch (err) {
            result.isValid = false;
            result.error = 'Invalid entity, please provide entity';
            logError(err, fileDetails, true);
        }
        return result;
    },
    validateOneFieldAuthenticity: (fieldKey, validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}] [validateOneFieldAuthenticity]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!fieldKey || !validateModelName || fieldKey.length === 0 || validateModelName.length === 0) {
                throw new Error('Invalid Parameters');
            }
            if (fieldKey === '_id') {
                result.isValid = true;
            } else if (fieldKey !== '_id' && validateModelName === 'User') {
                result.isValid = User.schema.paths.hasOwnProperty(fieldKey);
            } else if (fieldKey !== '_id' && validateModelName === 'Role') {
                result.isValid = Role.schema.paths.hasOwnProperty(fieldKey);
            } else if (fieldKey !== '_id' && validateModelName === 'TodoCategory') {
                result.isValid = TodoCategory.schema.paths.hasOwnProperty(fieldKey);
            } else if (fieldKey !== '_id' && validateModelName === 'Todo' && fieldKey !== 'todoCategoryId') {
                result.isValid = Todo.schema.paths.hasOwnProperty(fieldKey);
            } else if (fieldKey !== '_id' && validateModelName === 'Todo' && fieldKey === 'todoCategoryId') {
                result.isValid = true;
            }
            if (!result.isValid) {
                throw new Error(`Invalid field key: ${fieldKey}, validate model name: ${validateModelName}`);
            }
        } catch (err) {
            result.error = err.message;
            // logError(err, 'ModelValidateUtil.validateOneFieldAuthenticity', true);
        }
        return result;
    },
    validateFieldsAuthenticity: (fieldKeys = [], validateModelName) => {
        // const fileDetails = `[${filenameWithoutPath}], [validateFieldsAuthenticity]`;
        let result = {
            isValid: false,
            error: null,
        };
        try {
            if (!fieldKeys || !validateModelName || fieldKeys.length === 0 || validateModelName.length === 0) {
                throw new Error('Invalid Parameters');
            } else {
                fieldKeys.forEach((fieldKey) => {
                    const validateResult = ModelValidateUtil.validateOneFieldAuthenticity(fieldKey, validateModelName);
                    if (!validateResult.isValid) {
                        throw new Error(validateResult.error);
                    }
                });
                result.isValid = true;
            }
        } catch (err) {
            result.error = err.message;
            // logError(err, 'ModelValidateUtil.validateFieldsAuthenticity', true);
        }
        return result;
    },
};

module.exports = ModelValidateUtil;
