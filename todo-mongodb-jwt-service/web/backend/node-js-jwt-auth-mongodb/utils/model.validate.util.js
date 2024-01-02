const User = require('../models/mongodb/user.model');
const Role = require('../models/mongodb/role.model');
const TodoCategory = require('../models/mongodb/todo.category.model');
const Todo = require('../models/mongodb/todo.model');
const { logInfo, logError } = require('./log.util');

// const { filenameFilter } = require('./regex.util');
// const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const ModelValidateUtil = {
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
            } else if (fieldKey !== '_id' && validateModelName === 'Todo' && fieldKey !== 'category') {
                result.isValid = Todo.schema.paths.hasOwnProperty(fieldKey);
            } else if (fieldKey !== '_id' && validateModelName === 'Todo' && fieldKey === 'category') {
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
