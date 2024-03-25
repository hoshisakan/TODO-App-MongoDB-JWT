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
            // const result = await this.authService.verifyEmail(req.query);
            const result = await this.authService.verifyEmail(req.body);
            logInfo(`verifyEmail result: ${stringify(result)}`, fileDetails, true);
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };

    verifyResetPasswordToken = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            // const result = await this.authService.verifyResetPasswordToken(req.query);
            const result = await this.authService.verifyResetPasswordToken(req.body);
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
            const env = process.env.NODE_ENV || 'development';
            logInfo(`Read NODE ENV environment variable: ${env}`, fileDetails);

            res.cookie(key, value, {
                httpOnly: true,
                secure: env.trim() === 'production',
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
        let isClearSuccess = false;
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
                res.clearCookie(cookieName);
            });
            isClearSuccess = true;
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return isClearSuccess;
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
            // logInfo(`loginDto: ${stringify(loginDto)}`, fileDetails, true);

            const { clientResponse, clientCookie, message } = await this.authService.signin(loginDto);

            if (message) {
                // throw new Error('User was not signed in successfully!');
                throw new Error(message ?? 'User was not signed in successfully!');
            }

            logInfo(`clientCookie: ${stringify(clientCookie)}`, fileDetails, true);

            if (!clientCookie.isAccessTokenExistsInCookie && clientCookie.accessToken) {
                this.setItemToCookie(
                    res,
                    ACCESS_TOKEN_COOKIE_NAME,
                    clientCookie.accessToken,
                    clientCookie.accessTokenExpireSecondTime
                );
            }

            if (!clientCookie.isRefreshTokenExistsInCookie && clientCookie.refreshToken) {
                this.setItemToCookie(
                    res,
                    REFRESH_TOKEN_COOKIE_NAME,
                    clientCookie.refreshToken,
                    clientCookie.refreshTokenExpireSecondTime
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
            const refreshTokenDto = {
                cookieRefreshToken: this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME),
                cookieAccessToken: this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME),
            };

            result = await this.authService.refreshToken(refreshTokenDto);

            if (result.message) {
                // logInfo(result.message, fileDetails);
                throw new Error(result.message);
            }

            // logInfo(`result: ${stringify(result)}`, fileDetails, true);

            if (result.clientCookie.accessToken && result.clientCookie.accessTokenExpireSecondTime > 0) {
                // logInfo(`result.clientCookie: ${stringify(result.clientCookie)}`, fileDetails);
                this.setItemToCookie(
                    res,
                    ACCESS_TOKEN_COOKIE_NAME,
                    result.clientCookie.accessToken,
                    result.clientCookie.accessTokenExpireSecondTime
                );
            }
            // Verify if the cookie is successfully set
            const accessToken = this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME);
            if (accessToken) {
                logInfo(`Access token cookie is successfully set: ${accessToken}`, fileDetails);
            } else {
                logError(`Failed to set access token cookie`, fileDetails);
            }
            return http.successResponse(res, OK, '', result.clientResponse);
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
                const refreshTokenDto = {
                    cookieRefreshToken: this.getItemFromCookie(req, REFRESH_TOKEN_COOKIE_NAME),
                    cookieAccessToken: this.getItemFromCookie(req, ACCESS_TOKEN_COOKIE_NAME),
                };

                logInfo(`refreshTokenDto: ${stringify(refreshTokenDto)}`, fileDetails, true);

                if (!refreshTokenDto.cookieAccessToken && !refreshTokenDto.cookieRefreshToken) {
                    return http.successResponse(
                        res,
                        BAD_REQUEST,
                        'Not register account or account already logged out',
                        {
                            code: -2,
                        }
                    );
                }

                if (!refreshTokenDto.cookieAccessToken && refreshTokenDto.cookieRefreshToken) {
                    logInfo('Access token does exists in cookie, starting refresh access token', fileDetails);
                    const refreshTokenResult = await this.authService.refreshToken(refreshTokenDto);
                    logInfo(`Refresh token result: ${stringify(refreshTokenResult)}`, fileDetails);
                    if (refreshTokenResult.message) {
                        return http.successResponse(res, BAD_REQUEST, refreshTokenResult.message, '', {
                            code: -1,
                        });
                    }
                    this.setItemToCookie(
                        res,
                        ACCESS_TOKEN_COOKIE_NAME,
                        refreshTokenResult.clientCookie.accessToken,
                        refreshTokenResult.clientCookie.accessTokenExpireSecondTime
                    );
                    refreshTokenDto.cookieAccessToken = refreshTokenResult.clientCookie.accessToken;
                }
                validateTokenResult = await this.authService.verifyTokenValidity(
                    refreshTokenDto.cookieAccessToken,
                    ACCESS
                );
            }
            if (!validateTokenResult.data || validateTokenResult.message) {
                throw new Error(`Access token validate result: ${validateTokenResult.message}`);
            }
            // logInfo(`validateTokenResult: ${stringify(validateTokenResult)}`, fileDetails, true);
            return http.successResponse(res, OK, '', validateTokenResult.data);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message, {
                code: -1,
            });
        }
    };

    signout = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const isAllowedLogout = this.clearCookie(res);

            const result = {
                isAllowedLogout: isAllowedLogout,
                message: isAllowedLogout ? 'Logout success.' : 'Logout failed.',
            };
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
            const clientRequest = {
                tokenParseResult: {
                    userId: req.userId,
                    highestPermission: req.highestPermission,
                    accessTokenExpireUnixStampTime: req.accessTokenExpireUnixStampTime,
                },
            };

            logInfo(`clientRequest: ${stringify(clientRequest)}`, fileDetails, true);

            result = await this.authService.getCurrentUser(clientRequest);

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
            return http.successResponse(res, OK, '', result);
        } catch (err) {
            logError(err, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, err.message);
        }
    };
}

module.exports = AuthController;
