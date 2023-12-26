const { logError, logInfo } = require('../utils/log.util');
const http = require('../helpers/http.helper');
const { filenameFilter } = require('../utils/regex.util');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
    UNAUTHORIZED,
} = require('../helpers/constants.helper');

const AuthService = require('../services/auth.service');

class AuthController {
    constructor() {
        this.authService = new AuthService();
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

    signup = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            logInfo(`req.body: ${JSON.stringify(req.body)}`, fileDetails, true);
            const result = await this.authService.signup(req.body);

            if (!result) {
                throw new Error('User was not registered successfully!');
            }
            return http.successResponse(res, CREATED, 'User was registered successfully!');
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    getItemFromCookie = (req, cookieName) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            // if (cookieName in req.cookies)
            // {

            // }
            result = req.cookies[cookieName];
            logInfo(`getItemFromCookie result: ${cookie}`, fileDetails, true);
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return result;
    };

    signin = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const loginDto = req.body;
            logInfo(`req.body: ${JSON.stringify(loginDto)}`, fileDetails, true);

            const cookieName = '__refresh_token';
            let cookieRefreshToken = null;
            cookieRefreshToken = this.getItemFromCookie(req, cookieName);
            logInfo(`cookieRefreshToken: ${cookieRefreshToken}`, fileDetails, true);

            const { clientResponse, clientCookie } = await this.authService.signin(loginDto);

            if (!clientResponse || !clientCookie) {
                throw new Error('User was not authenticated successfully!');
            }

            if (clientCookie.isRefreshTokenExpired) {
                logInfo(`cookie is expired: ${clientCookie.refreshToken}`, fileDetails, true);
                res.cookie(cookieName, clientCookie.refreshToken, {
                    httpOnly: true, ///TODO: Disable other uesrs access to this cookie
                    secure: true, ///TODO: Only allow https access to this cookie
                    sameSite: 'none', ///TODO: only allow same site access to this cookie
                });
            }
            return http.successResponse(res, OK, clientResponse);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    refreshToken = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const cookieName = '__refresh_token';
            let cookieRefreshToken = null;
            cookieRefreshToken = this.getItemFromCookie(req, cookieName);
            logInfo(`cookieRefreshToken: ${cookieRefreshToken}`, fileDetails, true);

            const { clientResponse } = await this.authService.refreshToken(cookieRefreshToken);
            logInfo(`clientResponse: ${JSON.stringify(clientResponse)}`, fileDetails, true);
            return http.successResponse(res, OK, clientResponse);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    verifyToken = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const headerAccessToken = req.headers['x-access-token'];
            logInfo(`headerAccessToken: ${headerAccessToken}`, fileDetails, true);

            const result = await this.authService.verifyToken(headerAccessToken);
            logInfo(`result: ${JSON.stringify(result)}`, fileDetails, true);

            if (!result) {
                throw new Error('Token was not verified successfully!');
            }
            return http.successResponse(res, OK, result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, err.message);
        }
    };
}

module.exports = AuthController;
