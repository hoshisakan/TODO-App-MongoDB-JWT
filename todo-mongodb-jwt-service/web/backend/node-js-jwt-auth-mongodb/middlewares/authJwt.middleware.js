const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const http = require('../helpers/http.helper.js');
const { printErrorDetails, log } = require('../utils/debug.util.js');
const { stringify } = require('../utils/json.util.js');

const {
    BAD_REQUEST,
    UNAUTHORIZED,
} = require('../helpers/constants.helper.js');

const AuthService = require('../services/auth.service');

const authService = new AuthService();

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

    log(`verifyToken: ${token}`, true);

    if (!token) {
        return http.errorResponse(res, BAD_REQUEST, 'No token provided!');
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            printErrorDetails(err, true);
            return http.errorResponse(res, UNAUTHORIZED, 'Unauthorized!');
        }
        ///TODO: If verified successfully, the playload decoded will contain the id of the user.
        req.userId = decoded.id;
        return next();
    });
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
}

isAdmin = async (req, res, next) => {
    try {
        const userOwnRoleList = await authService.findUserRolesById(req.userId);

        const isAdmin = isMatchRole(userOwnRoleList, 'admin');

        log(`isAdmin: ${isAdmin}`, true);

        if (!isAdmin) {
            throw new Error('Admin role not found.');
        }
        return next();
    } catch (error) {
        printErrorDetails(error, true);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

isModerator = async (req, res, next) => {
    try {
        const userOwnRoleList = await authService.findUserRolesById(req.userId);

        log(`userOwnRoleList: ${stringify(userOwnRoleList)}`, true);

        const isModerator = isMatchRole(userOwnRoleList, 'moderator');

        log(`isModerator: ${isModerator}`, true);

        if (!isModerator) {
            throw new Error('Moderator role not found.');
        }
        return next();
    } catch (error) {
        printErrorDetails(error);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator,
};
module.exports = authJwt;

const verifySignUp = require('./verifySignUp.middlewares.js');

module.exports = {
    authJwt,
    verifySignUp,
};
