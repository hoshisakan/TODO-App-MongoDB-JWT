const { logError, logInfo } = require('../../utils/log.util.js');
const http = require('../../helpers/http.helper.js');
const { stringify } = require('../../utils/json.util.js');
const { filenameFilter } = require('../../utils/regex.util.js');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
    UNAUTHORIZED,
} = require('../../helpers/constants.helper.js');
const { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } = require('../../config/cookie.config.js');
const { ACCESS, REFRESH } = require('../../config/auth.type.config.js');

const AuthService = require('../../services/v1/auth.service.js');


class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.cookieNameList = [ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME];
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

    verifyEmail = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.authService.verifyEmail(req.query);
            logInfo(`verifyEmail result: ${stringify(result)}`, fileDetails, true);
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    verifyResetPassword = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.authService.verifyResetPassword(req.query);
            logInfo(`verifyResetPassword result: ${stringify(result)}`, fileDetails, true);
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    reSendConfirmEmail = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            logInfo(`req.body: ${stringify(req.body)}`, fileDetails, true);
            const result = await this.authService.reSendConfirmEmail(req.body);

            if (!result.isReSendConfirmEmail) {
                throw new Error(result.message);
            }
            return http.successResponse(res, CREATED, 'Re-send confirm email successfully!', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    signup = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            logInfo(`req.body: ${stringify(req.body)}`, fileDetails, true);
            const result = await this.authService.signup(req.body);
            return http.successResponse(res, CREATED, 'User was registered successfully!', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
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

    ///TODO: Set specific name of cookie
    setItemToCookie = (res, key, value, expireTime) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!key || !value) {
                throw new Error('Invalid key or value!');
            }
            res.cookie(key, value, {
                httpOnly: true,
                secure: false,
                // sameSite: 'none',
                sameSite: 'strict',
                maxAge: expireTime * 1000,
            });
        } catch (err) {
            logError(err, fileDetails, true);
        }
    };

    ///TODO: Clear specific name of cookie
    clearCookie = (res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            this.cookieNameList.forEach((cookieName) => {
                logInfo(`clear cookie name: ${cookieName}`, fileDetails, true);
                // res.clearCookie(cookieName);
                res.cookie(cookieName, '', {
                    // expires: new Date(0), // Notworking
                    maxAge: new Date(0), // Set cookie expire time
                    // secure: true, // Only allow https send
                    secure: false,
                    httpOnly: true, // Avoid Javascript read cookie content, limit onlt server can read it
                    // sameSite: 'none'
                    sameSite: 'strict', // Allow client cross domain request
                });
            });
        } catch (err) {
            logError(err, fileDetails, true);
        }
    };

    ///TODO: Handle client login request
    signin = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let loginDto = null;
        try {
            loginDto = req.body;
            logInfo(`req.body: ${stringify(loginDto)}`, fileDetails, true);

            loginDto.cookieAccessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME);
            loginDto.cookieRefreshToken = this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME);
            logInfo(`loginDto: ${stringify(loginDto)}`, fileDetails, true);

            const { clientResponse, clientCookie } = await this.authService.signin(loginDto);

            if (!clientResponse || !clientCookie) {
                throw new Error('User was not signed in successfully!');
            }

            logInfo(`clientCookie: ${stringify(clientCookie)}`, fileDetails, true);

            if (!clientCookie.isAccessTokenExistsInCookie && clientCookie.accessToken) {
                this.setItemToCookie(
                    res,
                    ACCESS_TOKEN_COOKIE_NAME,
                    clientCookie.accessToken,
                    clientCookie.accessTokenExpireTime
                );
            }

            if (!clientCookie.isRefreshTokenExistsInCookie && clientCookie.refreshToken) {
                this.setItemToCookie(
                    res,
                    REFRESH_TOKEN_COOKIE_NAME,
                    clientCookie.refreshToken,
                    clientCookie.refreshTokenExpireTime
                );
            }
            logInfo(`clientResponse: ${stringify(clientResponse)}`, fileDetails, true);
            return http.successResponse(res, OK, 'Login Successfully!', clientResponse);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    refreshToken = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            const cookieRefreshToken = this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME);
            logInfo(`cookieRefreshToken: ${stringify(cookieRefreshToken)}`, fileDetails, true);
            if (!cookieRefreshToken) {
                throw new Error('Invalid cookie refresh token!');
            }
            result = await this.authService.refreshToken(cookieRefreshToken);
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            if (!result) {
                throw new Error('Token was not refreshed successfully!');
            }
            this.setItemToCookie(res, ACCESS_TOKEN_COOKIE_NAME, result.token, result.expireTime);
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    verifyToken = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let validateTokenResult = null;
        try {
            const authType = req.body.authType || null;

            if (!authType) {
                throw new Error('Invalid authType!');
            }

            logInfo(`authType: ${stringify(authType)}`, fileDetails, true);

            if (authType !== ACCESS && authType !== REFRESH) {
                throw new Error('Invalid authType!');
            }

            if (authType === REFRESH) {
                const cookieRefreshToken = this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME) || null;
                logInfo(`cookieRefreshToken: ${stringify(cookieRefreshToken)}`, fileDetails, true);
                if (!cookieRefreshToken) {
                    throw new Error('Invalid cookie refresh token!');
                }
                validateTokenResult = await this.authService.verifyTokenValidity(cookieRefreshToken, REFRESH);
            } else {
                // const headerAccessToken = req.headers['x-access-token'];
                // logInfo(`headerAccessToken: ${headerAccessToken}`, fileDetails, true);
                const cookieAccessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME) || null;
                logInfo(`cookieAccessToken: ${stringify(cookieAccessToken)}`, fileDetails, true);
                const cookieRefreshToken = this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME) || null;
                logInfo(`cookieRefreshToken: ${stringify(cookieRefreshToken)}`, fileDetails, true);

                if (!cookieAccessToken && !cookieRefreshToken) {
                    return http.successResponse(
                        res,
                        BAD_REQUEST,
                        'Not register account or account already logged out',
                        {
                            code: -2,
                        }
                    );
                }

                if (!cookieAccessToken && cookieRefreshToken) {
                    logInfo('Please refresh token', fileDetails);
                    const refreshTokenResult = await this.authService.refreshToken(cookieRefreshToken);
                    logInfo(`Refresh token result: ${stringify(refreshTokenResult)}`);
                    if (!refreshTokenResult.token) {
                        return http.successResponse(res, BAD_REQUEST, 'Please try login again', '', {
                            code: -1,
                        });
                    }
                    this.setItemToCookie(
                        res,
                        ACCESS_TOKEN_COOKIE_NAME,
                        refreshTokenResult.token,
                        refreshTokenResult.expireSecondTime
                    );
                }
                validateTokenResult = await this.authService.verifyTokenValidity(cookieAccessToken, ACCESS);
            }
            // logInfo(`validateTokenResult: ${stringify(validateTokenResult)}`, fileDetails, true);
            return http.successResponse(res, OK, 'Verify successfully', validateTokenResult);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, UNAUTHORIZED, err.message, {
                code: -1,
            });
        }
    };

    signout = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const cookieAccessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME);
            const cookieRefreshToken = this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME);

            logInfo(`cookieAccessToken: ${stringify(cookieAccessToken)}`, fileDetails, true);
            logInfo(`cookieRefreshToken: ${stringify(cookieRefreshToken)}`, fileDetails, true);

            const logoutDto = {
                username: req.body.username || null,
                email: req.body.email || null,
                cookieAccessToken,
                cookieRefreshToken,
            };

            logInfo(`logoutDto: ${stringify(logoutDto)}`, fileDetails, true);

            if (!cookieAccessToken && !cookieRefreshToken) {
                logInfo(`No token provided!`, fileDetails, true);
            }

            const result = await this.authService.signout(logoutDto);

            if (!result || !result.isAllowedLogout) {
                throw new Error('User was not signed out successfully!');
            }
            this.clearCookie(res);

            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    getCurrentUser = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            const cookieAccessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME);

            if (!cookieAccessToken) {
                throw new Error('Get access token from cookie failed.');
            }

            result = await this.authService.getCurrentUser(cookieAccessToken);

            if (result.message) {
                throw new Error(result.message);
            }
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    forgetPassword = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            result = await this.authService.forgetPassword(req.body);
            if (result.message) {
                throw new Error(result.message);
            }
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    resetPassword = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;
        try {
            result = await this.authService.resetPassword(req.body);
            if (result.message) {
                throw new Error(result.message);
            }
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };
}

module.exports = AuthController;
