const http = require('../helpers/http.helper.js');
const { logInfo, logError } = require('../utils/log.util.js');
const { stringify } = require('../utils/json.util.js');
const { filenameFilter } = require('../utils/regex.util');
const { BAD_REQUEST, UNAUTHORIZED } = require('../helpers/constants.helper.js');

const AuthService = require('../services/auth.service');
const authService = new AuthService();
const { verifyToken } = require('../utils/jwt.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();


getFunctionCallerName = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    const functionName = stack[2].trim().split(' ')[1];
    return functionName;
};

getFileDetails = (classAndFuncName) => {
    const classAndFuncNameArr = classAndFuncName.split('.');
    return `[${filenameWithoutPath}] [${classAndFuncNameArr}]`;
};

///TODO:
getUserHighestRoleNameById = async (userId) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userOwnRoleList = await authService.findUserRolesById(userId, true);
        logInfo(`userOwnRoleList: ${stringify(userOwnRoleList)}`, fileDetails, true);
        const userOwnHighestPermission = userOwnRoleList[0].name;
        logInfo(`userOwnHighestPermission: ${stringify(userOwnHighestPermission)}`, fileDetails, true);
        return userOwnHighestPermission;
    } catch (err) {
        logError(err, fileDetails, true);
        return null;
    }
};

///TODO: Verify refresh token
///TODO: req - request (client -> server), res - response (server -> client), next - next middleware ( server -> next middleware)
verifyAcccessToken = (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = getFileDetails(classNameAndFuncName);

    try {
        let token = req.headers['x-access-token'];

        logInfo(`verifyToken: ${token}`, fileDetails, true);

        if (!token) {
            return http.errorResponse(res, BAD_REQUEST, 'No token provided!');
        }

        const decoded = verifyToken(token, 'access')

        logInfo(`decoded: ${stringify(decoded)}`, fileDetails, true);

        if (!decoded) {
            logInfo(`decoded is null`, fileDetails, true);
            throw new Error('Unauthorized!');
        }

        req.user = {}
        req.user.id = decoded.id;
        req.user.permission = getUserHighestRoleNameById(decoded.id);

        logInfo(`verifyAcccessToken req.user: ${stringify(req.user)}`, fileDetails, true);

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
    const fileDetails = getFileDetails(classNameAndFuncName);

    try {
        let token = req.headers['x-access-token'];

        logInfo(`verifyToken: ${token}`, fileDetails, true);

        if (!token) {
            return http.errorResponse(res, BAD_REQUEST, 'No token provided!');
        }

        const decoded = verifyToken(token, 'refresh')

        logInfo(`decoded: ${stringify(decoded)}`, fileDetails, true);

        if (!decoded) {
            logInfo(`decoded is null`, fileDetails, true);
            throw new Error('Unauthorized!');
        }

        req.user = {}
        req.user.id = decoded.id;
        req.user.permission = getUserHighestRoleNameById(decoded.id);

        logInfo(`verifyRefreshToken req.user: ${stringify(req.user)}`, fileDetails, true);

        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, UNAUTHORIZED, err.message);
    }
};

isMatchRole = (userOwnRoleList, checkRole) => {
    if (!userOwnRoleList || !checkRole) {
        return false;
    }
    ///TODO: find method returns the value of the first element in the provided array that satisfies the provided testing function.
    // userOwnRoleList.find((role) => role.name === checkRole) !== undefined;
    ///TODO: some method returns true if at least one element in the array passes the test implemented by the provided function.
    ///TODO: some method equals to C# LINQ Any method.
    return userOwnRoleList.some((role) => role.name === checkRole);
};

isAdmin = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userOwnRoleList = await authService.findUserRolesById(req.user.id);
        // logInfo(`userOwnRoleList: ${stringify(userOwnRoleList)}`, fileDetails, true);

        const isAdmin = isMatchRole(userOwnRoleList, 'admin');
        logInfo(`isAdmin: ${isAdmin}`, fileDetails, true);

        if (!isAdmin) {
            logInfo(`Admin role not found.`, fileDetails, true);
            throw new Error('Unauthorized!');
        }
        req.user.permission = 'admin';
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

isModerator = async (req, res, next) => {
    const classNameAndFuncName = getFunctionCallerName();
    const fileDetails = getFileDetails(classNameAndFuncName);
    try {
        const userOwnRoleList = await authService.findUserRolesById(req.user.id);
        // logInfo(`userOwnRoleList: ${stringify(userOwnRoleList)}`, fileDetails, true);

        const isModerator = isMatchRole(userOwnRoleList, 'moderator');
        logInfo(`isModerator: ${isModerator}`, fileDetails, true);

        if (!isModerator) {
            logInfo(`Moderator role not found.`, fileDetails, true);
            throw new Error('Unauthorized!');
        }
        res.user.permission = 'moderator';
        return next();
    } catch (err) {
        logError(err, fileDetails, true);
        return http.errorResponse(res, BAD_REQUEST, err.message);
    }
};

const authJwt = {
    verifyAcccessToken,
    isAdmin,
    isModerator,
};
module.exports = authJwt;

const verifySignUp = require('./verifySignUp.middlewares.js');

module.exports = {
    authJwt,
    verifySignUp,
};
