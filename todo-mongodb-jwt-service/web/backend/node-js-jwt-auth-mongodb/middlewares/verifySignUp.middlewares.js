const db = require('../models');
const ROLES = db.ROLES;
const User = db.user;
const { printErrorDetails, log } = require('../utils/debug.util');
const http = require('../helpers/http.helper');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
} = require('../helpers/constants.helper');

checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const isUserExists = await User.findOne({
            username: req.body.username,
        });
        if (isUserExists) {
            return http.errorResponse(res, BAD_REQUEST, 'Failed! Username is already in use!');
        }
        const isEmailExists = await User.findOne({
            email: req.body.email,
        });
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
        log('checkRolesExisted');
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
        printErrorDetails(error);
        http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
};

module.exports = verifySignUp;
