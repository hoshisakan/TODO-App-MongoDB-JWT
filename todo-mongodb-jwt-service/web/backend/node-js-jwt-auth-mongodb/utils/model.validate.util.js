const User = require('../models/mongodb/user.model');
const Role = require('../models/mongodb/role.model');

const ModelValidateUtil = {
    validateOneFieldAuthenticity: (fieldKey, validateModelName) => {
        if (!fieldKey || !validateModelName) {
            return false;
        }
        if (fieldKey === '_id') {
            return true;
        }
        if (validateModelName === 'User') {
            return User.schema.paths.hasOwnProperty(fieldKey);
        }
        else if (validateModelName === 'Role') {
            return Role.schema.paths.hasOwnProperty(fieldKey);
        }
        return false;
    },
    validateFieldsAuthenticity: (fieldKeys=[], validateModelName) => {
        if (!fieldKeys || !validateModelName) {
            return false;
        }
        if (fieldKeys.length === 0) {
            return false;
        }
        let result = false;
        result = fieldKeys.every((fieldKey) => {
            const isFieldKeyValid = ModelValidateUtil.validateOneFieldAuthenticity(fieldKey, validateModelName);
            return isFieldKeyValid;
        });
        return result;
    },
}

module.exports = ModelValidateUtil;