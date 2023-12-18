const db = require('../models');
const ROLES = db.ROLES;
const { printErrorDetails, log } = require('../utils/debug.util');
const http = require('../helpers/http.helper');
const {
    BAD_REQUEST,
} = require('../helpers/constants.helper');

const UserService = require('../services/user.service');
const userService = new UserService();


checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const params = req.body;
        const isUserExists = await userService.findOne(params, checkField = 'username');

        if (isUserExists) {
            return http.errorResponse(res, BAD_REQUEST, 'Failed! Username is already in use!');
        }

        const isEmailExists = await userService.findOne(params, checkField = 'email');

        if (isEmailExists) {
            return http.errorResponse(res, BAD_REQUEST, 'Failed! Email is already in user');
        }
        return next();
    } catch (error) {
        printErrorDetails(error);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

checkRolesExisted = (req, res, next) => {
    try {
        if (req.body.roles) {
            ROLES.forEach((role) => {
                log(`Authentication role: ${role}`, true);
            });

            for (let i = 0; i < req.body.roles.length; i++) {
                log(req.body.roles[i], true);
                if (!ROLES.includes(req.body.roles[i])) {
                    http.errorResponse(res, BAD_REQUEST, `Failed! Role ${req.body.roles[i]} does not exist!`);
                }
            }
        } else {
            throw new Error('Roles is required');
        }
        return next();
    } catch (error) {
        printErrorDetails(error, true);
        http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
};

module.exports = verifySignUp;
