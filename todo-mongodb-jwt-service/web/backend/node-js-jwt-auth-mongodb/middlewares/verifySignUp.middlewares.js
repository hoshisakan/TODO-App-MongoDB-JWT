const db = require('../models/mongodb');
const ROLES = db.ROLES;
const { logError, logInfo } = require('../utils/log.util');
const http = require('../helpers/http.helper');
const { BAD_REQUEST } = require('../helpers/constants.helper');
// const { filenameFilter } = require('../utils/regex.util');

const UserService = require('../services/v1/user.service');
const userService = new UserService();

// const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

getFunctionCallerName = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    const functionName = stack[2].trim().split(' ')[1];
    return functionName;
};

checkDuplicateUsernameOrEmail = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = `[verifySignUp.middlewares.js] [${classNameAndFuncName.split('.')}]`;
    try {
        const params = req.body;
        // logInfo(`params: ${JSON.stringify(params)}`, fileDetails, true);

        const isUserExists = await userService.checkUserExistsByUsername(params.username);
        logInfo(`isUserExists: ${JSON.stringify(isUserExists)}`, fileDetails, true);

        if (isUserExists) {
            return http.errorResponse(res, BAD_REQUEST, 'Failed! Username is already in use!');
        }

        const isEmailExists = await userService.checkUserExistsByEmail(params.email);
        logInfo(`isEmailExists: ${JSON.stringify(isEmailExists)}`, fileDetails, true);

        if (isEmailExists) {
            return http.errorResponse(res, BAD_REQUEST, 'Failed! Email is already in use');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

checkRolesExisted = (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = `[verifySignUp.middlewares.js] [${classNameAndFuncName.split('.')}]`;
    try {
        const checkRoles = req.body.roles;
        logInfo(`checkRoles: ${JSON.stringify(checkRoles)}`, fileDetails, true);

        if (checkRoles) {
            const isAnyRoleNotExists = checkRoles.some((role) => !ROLES.includes(role));

            if (isAnyRoleNotExists) {
                throw new Error(`Failed! Role does not exist!`);
            }
        } else {
            throw new Error('Roles is required');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    // checkRolesExisted,
};

module.exports = verifySignUp;
