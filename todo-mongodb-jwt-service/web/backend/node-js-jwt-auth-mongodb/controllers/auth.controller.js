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

    signin = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const loginDto = req.body;
            logInfo(`req.body: ${JSON.stringify(loginDto)}`, fileDetails, true);

            const cookieName = '__refresh_token';
            let cookieRefreshToken = null;

            if (cookieName in req.cookies) {
                cookieRefreshToken = req.cookies.__refresh_token;
                logInfo(`cookie exists: ${cookieRefreshToken}`, fileDetails, true);
            }
            else
            {
                logInfo(`cookie doesn't exists: ${req.cookies.__refresh_token}`, fileDetails, true);
            }

            const { clientResponse, clientCookie } = await this.authService.signin(loginDto, cookieRefreshToken);

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
            const validateToken = req.cookies.__refresh_token;
            logInfo(`refreshToken: ${refreshToken}`, fileDetails, true);
            const { clientResponse } = await this.authService.refreshToken(validateToken);



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
            const token = req.headers['x-access-token'];
            logInfo(`token: ${token}`, fileDetails, true);
            const { clientResponse } = await this.authService.verifyToken(token);

            if (!clientResponse) {
                throw new Error('User was not authenticated successfully!');
            }
            return http.successResponse(res, OK, clientResponse);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };
}

module.exports = AuthController;
