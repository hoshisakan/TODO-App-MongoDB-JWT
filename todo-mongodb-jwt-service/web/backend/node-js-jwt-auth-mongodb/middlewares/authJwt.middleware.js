const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models/index.js');
const User = db.user;
const Role = db.role;
const http = require('../helpers/http.helper.js');
const DebugHelper = require('../utils/debug.util.js');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
} = require('../helpers/constants.helper.js');

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

    DebugHelper.log(`token: ${token}`);

    if (!token) {
        return http.errorResponse(res, 403, 'No token provided!');
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return http.errorResponse(res, 401, 'Unauthorized!');
        }
        req.userId = decoded.id;
        return next();
    });
};

isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            throw new Error('User not found.');
        }

        const userOwnRolesList = await Role.find({
            _id: { $in: user.roles },
        });

        if (!userOwnRolesList) {
            throw new Error('User roles not found.');
        }

        if (userOwnRolesList) {
            for (let i = 0; i < userOwnRolesList.length; i++) {
                if (userOwnRolesList[i].name === 'admin') {
                    return next();
                }
            }
        }
        throw new Error('Admin role not found.');
    } catch (error) {
        DebugHelper.printErrorDetails(error);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

isModerator = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            throw new Error('User not found.');
        }

        const userOwnRolesList = await Role.find({
            _id: { $in: user.roles },
        });

        if (!userOwnRolesList) {
            throw new Error('User roles not found.');
        }

        if (userOwnRolesList) {
            for (let i = 0; i < userOwnRolesList.length; i++) {
                if (userOwnRolesList[i].name === 'moderator') {
                    return next();
                }
            }
        }
        throw new Error('Moderator role not found.');
    } catch (error) {
        DebugHelper.printErrorDetails(error);
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
