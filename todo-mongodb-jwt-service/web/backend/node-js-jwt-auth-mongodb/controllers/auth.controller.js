const config = require('../config/auth.config');
const db = require('../models');
const DebugHelper = require('../utils/error.utils');
const http = require('../helpers/http.helper');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
} = require('../helpers/constants.helper');

const User = db.user;
const Role = db.role;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });

        const userCreatedResult = await user.save();

        if (req.body.roles) {
            const roles = await Role.find({
                name: { $in: req.body.roles },
            });

            // DebugHelper.log(`roles: ${roles}`);

            userCreatedResult.roles = roles.map((role) => role._id);

            // DebugHelper.log(`userCreatedResult.roles: ${userCreatedResult.roles}`);

            await userCreatedResult.save();

            return http.successResponse(res, CREATED, userCreatedResult);
        } else {
            const role = await Role.findOne({ name: 'user' });

            // DebugHelper.log(`role: ${role}`);

            userCreatedResult.roles = [role._id];

            // DebugHelper.log(`userCreatedResult.roles: ${userCreatedResult.roles}`);

            await userCreatedResult.save();

            return http.successResponse(res, CREATED, userCreatedResult);
        }
    } catch (error) {
        DebugHelper.printErrorDetails(error);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};

exports.signin = async (req, res) => {
    try {
        const userFindResult = await User.findOne({
            username: req.body.username,
        });

        DebugHelper.log(`userFindResult: ${userFindResult}`);

        if (!userFindResult) {
            return http.errorResponse(res, NOT_FOUND, 'User Not found.');
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, userFindResult.password);

        if (!passwordIsValid) {
            return http.errorResponse(res, BAD_REQUEST, 'Invalid Password!');
        } else {
            const token = jwt.sign({ id: userFindResult.id }, config.secret, {
                // expiresIn: 86400, // 24 hours
                expiresIn: 60, // 24 hours
            });

            const authorities = [];

            DebugHelper.log(`userFindResult.roles: ${userFindResult.roles}`);

            const roles = await Role.find({
                _id: { $in: userFindResult.roles },
            });

            for (let i = 0; i < roles.length; i++) {
                authorities.push('ROLE_' + roles[i].name.toUpperCase());
            }

            return http.successResponse(res, OK, {
                id: userFindResult._id,
                username: userFindResult.username,
                email: userFindResult.email,
                roles: authorities,
                accessToken: token,
            });
        }
    } catch (error) {
        DebugHelper.printErrorDetails(error);
        return http.errorResponse(res, BAD_REQUEST, error.message);
    }
};
