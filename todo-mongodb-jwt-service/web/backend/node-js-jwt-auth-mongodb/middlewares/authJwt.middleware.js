const http = require('../helpers/http.helper.js');
const { logInfo, logError } = require('../utils/log.util.js');
const { stringify } = require('../utils/json.util.js');
const { filenameFilter } = require('../utils/regex.util');
const { BAD_REQUEST, UNAUTHORIZED } = require('../helpers/constants.helper.js');

const AuthService = require('../services/v1/auth.service.js');
const authService = new AuthService();
const { verifyToken } = require('../utils/jwt.util.js');
const { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } = require('../config/cookie.config.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const getFunctionCallerName = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    const functionName = stack[2].trim().split(' ')[1];
    return functionName;
};

const getFileDetails = (classAndFuncName) => {
    const classAndFuncNameArr = classAndFuncName.split('.');
    return `[${filenameWithoutPath}] [${classAndFuncNameArr}]`;
};

let userOwnRoleList = [];

///TODO: Verify refresh token
///TODO: req - request (client -> server), res - response (server -> client), next - next middleware ( server -> next middleware)
verifyAcccessToken = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        // const token = req.headers['x-access-token'];
        const token = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
        logInfo(`verifyToken: ${token}`, fileDetails, true);

        if (!token) {
            return http.errorResponse(res, BAD_REQUEST, 'No token provided!');
        }

        const decodedResult = verifyToken(token, ACCESS);

        if (!decodedResult.data || decodedResult.message) {
            throw new Error(decodedResult.message);
        }
        logInfo(`decodedResult: ${stringify(decodedResult)}`, fileDetails);

        req.userId = decodedResult.data['id'];
        logInfo(`req.userId: ${req.userId}`, fileDetails, true);

        userOwnRoleList = await authService.findUserRolesById(req.userId, true);
        req.highestPermission = userOwnRoleList[0]['name'];
        logInfo(`req.highestPermission: ${req.highestPermission}`, fileDetails, true);

        req.accessTokenExpireUnixStampTime = decodedResult.data['exp'];
        logInfo(`req.accessTokenExpireUnixStampTime: ${req.accessTokenExpireUnixStampTime}`, fileDetails, true);

        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, UNAUTHORIZED, err.message);
    }
};

///TODO: Verify token
///TODO: req - request (client -> server), res - response (server -> client), next - next middleware ( server -> next middleware)
verifyRefreshToken = (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);

    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
        logInfo(`verifyToken: ${token}`, fileDetails, true);

        if (!token) {
            return http.errorResponse(res, BAD_REQUEST, 'No token provided!');
        }

        const decodedResult = verifyToken(token, REFRESH);

        if (!decodedResult.data || decodedResult.message) {
            throw new Error(decodedToken.message);
        }

        req.userId = decodedResult.data['id'];
        logInfo(`req.userId: ${req.userId}`, fileDetails, true);

        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, UNAUTHORIZED, err.message);
    }
};

isMatchRole = (userOwnRoleList, checkRole = []) => {
    if (!userOwnRoleList || !checkRole || checkRole.length === 0) {
        return false;
    }
    ///TODO: find method returns the value of the first element in the provided array that satisfies the provided testing function.
    // userOwnRoleList.find((role) => role.name === checkRole) !== undefined;
    ///TODO: some method returns true if at least one element in the array passes the test implemented by the provided function.
    ///TODO: some method equals to C# LINQ Any method.
    // return userOwnRoleList.some((role) => role.name === checkRole);
    return userOwnRoleList.some((role) => checkRole.includes(role.name));
};

isAdmin = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userId = req.userId || null;

        if (!userId) {
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        logInfo(`userId: ${userId}`, fileDetails, true);

        const isAdmin = isMatchRole(userOwnRoleList, ['admin']);
        logInfo(`isAdmin: ${isAdmin}`, fileDetails, true);

        if (!isAdmin) {
            logInfo(`Admin role not found.`, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

isDevelopment = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userId = req.userId || null;

        if (!userId) {
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        logInfo(`userId: ${userId}`, fileDetails, true);

        const isDevelopment = isMatchRole(userOwnRoleList, ['admin', 'development']);
        logInfo(`isDevelopment: ${isDevelopment}`, fileDetails, true);

        if (!isDevelopment) {
            logInfo(`Development role not found.`, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

isModerator = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userId = req.userId || null;

        if (!userId) {
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        logInfo(`userId: ${userId}`, fileDetails, true);

        const isModerator = isMatchRole(userOwnRoleList, ['admin', 'moderator']);
        logInfo(`isModerator: ${isModerator}`, fileDetails, true);

        if (!isModerator) {
            logInfo(`Moderator role not found.`, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

isUser = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    // const fileDetails = `[authJwt.middleware.js] [${classNameAndFuncName.split('.')}]`;
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userId = req.userId || null;

        if (!userId) {
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        logInfo(`userId: ${userId}`, fileDetails, true);

        const isUser = isMatchRole(userOwnRoleList, ['admin', 'user']);
        logInfo(`isUser: ${isUser}`, fileDetails, true);

        if (!isUser) {
            logInfo(`User role not found.`, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

const authJwt = {
    verifyAcccessToken,
    isAdmin,
    isDevelopment,
    isModerator,
    isUser,
};
module.exports = authJwt;

const verifySignUp = require('./verifySignUp.middlewares.js');
const { ACCESS, REFRESH } = require('../config/auth.type.config.js');

module.exports = {
    authJwt,
    verifySignUp,
};
