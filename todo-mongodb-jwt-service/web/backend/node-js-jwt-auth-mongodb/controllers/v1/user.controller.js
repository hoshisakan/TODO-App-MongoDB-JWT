const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const { OK, BAD_REQUEST } = require('../../helpers/constants.helper');
const JWTUtil = require('../../../node-js-jwt-auth-mongodb/utils/jwt.util')
const { ACCESS_TOKEN_COOKIE_NAME } = require('../../config/cookie.config.js');

const UserService = require('../../services/v1/user.service');
const { stringify } = require('../../utils/json.util.js');


class UserController {
    constructor() {
        this.userService = new UserService();
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    deleteById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.userService.deleteById(req.params.id);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    getItemFromCookie = (req, key) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            if (!req || !req.cookies) {
                throw new Error('Invalid request or cookies!');
            }
            result = req.cookies[key] || null;
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return result;
    };

    findById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            let result = await this.userService.findById(req.params.id);

            result = result.toObject();

            const accessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME);

            const decodedResult = JWTUtil.decodeToken(accessToken);

            if (!decodedResult) {
                throw new Error('Decode access token failed, cannot be analysis token expire time.');
            }
            // logInfo(`${stringify(decodedResult)}`, fileDetails, true);

            result['accessTokenExpireTime'] = decodedResult.exp;

            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    deleteAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            const result = await this.userService.deleteAll();
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    findAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.userService.findAll(req.query);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = UserController;
