var bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../../utils/log.util');
const { stringify, parse } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');
const { sendMail } = require('../../utils/email.util');
const {
    ACCESS,
    REFRESH,
    EMAILCONFIRM,
    RESETPASSWORD,
    CONFIRMEMAILVERIFYACTION,
    RESETPASSWORDVERIFYACTION,
} = require('../../config/auth.type.config.js');

const {
    generateToken,
    verifyToken,
    setTokenToCache,
    getTokenFromCache,
    checkTokenExistsFromCache,
    removeTokenFromCache,
} = require('../../utils/jwt.util');
const UnitOfWork = require('../../repositories/unitwork');
const User = require('../../models/mongodb/user.model');
const unitOfWork = new UnitOfWork();

class AuthService {
    constructor() {
        this.unitOfWork = unitOfWork;
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

    findUserById = async (id, fields = {}, fkFields = {}) => {
        if (!id) {
            throw new Error('User id cannot be empty.');
        }
        return await this.unitOfWork.users.findById(id, fields, fkFields);
    };

    findUserRolesById = async (userId, isDesc) => {
        if (!userId) {
            throw new Error('User id cannot be empty.');
        }

        const user = await this.findUserById(userId);

        if (!user) {
            throw new Error('User not found.');
        }

        let result = await this.unitOfWork.roles.find({
            _id: { $in: user.roles },
        });

        if (!result) {
            throw new Error('User roles not found.');
        }

        if (isDesc) {
            result = result.sort((a, b) => b.level - a.level);
        } else {
            result = result.sort((a, b) => a.level - b.level);
        }
        return result;
    };

    ///TODO: Get user highest role name by user id
    getUserHighestRoleNameById = async (userId) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const userOwnRoleList = await this.findUserRolesById(userId, true);
            logInfo(`userOwnRoleList: ${stringify(userOwnRoleList)}`, fileDetails, true);
            const userOwnHighestPermission = userOwnRoleList[0].name;
            logInfo(`userOwnHighestPermission: ${stringify(userOwnHighestPermission)}`, fileDetails, true);
            return userOwnHighestPermission;
        } catch (err) {
            // logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Refresh access token through refresh token
    refreshToken = async (refreshTokenDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            clientResponse: {
                id: '',
                username: '',
                email: '',
                roles: [],
                accessTokenExpireUnixStampTime: 0,
            },
            clientCookie: {
                accessToken: '',
                accessTokenExpireSecondTime: 0,
            },
            message: '',
        };
        try {
            if (!refreshTokenDto.cookieRefreshToken) {
                throw new Error('Refresh token is required.');
            }

            const refreshTokenValidateResult = verifyToken(refreshTokenDto.cookieRefreshToken, REFRESH);
            logInfo(`refreshTokenValidateResult: ${stringify(refreshTokenValidateResult)}`, fileDetails, true);

            if (!refreshTokenValidateResult.data || refreshTokenValidateResult.message) {
                throw new Error(`Refresh token has been expired`);
            }

            const userValidateResult = await this.validateUserIdentity({
                _id: refreshTokenValidateResult.data['id'],
            });

            if (userValidateResult.message) {
                throw new Error(userValidateResult.message);
            }

            if (refreshTokenDto.cookieAccessToken) {
                const oldCookieAccessTokenValidateResult = verifyToken(refreshTokenDto.cookieAccessToken, ACCESS);
                logInfo(
                    `oldCookieAccessTokenValidateResult: ${stringify(oldCookieAccessTokenValidateResult)}`,
                    fileDetails,
                    true
                );
                if (!oldCookieAccessTokenValidateResult.data || oldCookieAccessTokenValidateResult.message) {
                    const generateAccessTokenResult = await this.generateTokenAndStorageCache(
                        {
                            id: userValidateResult.user.id,
                        },
                        ACCESS,
                        userValidateResult
                    );
                    result.clientCookie.accessToken = generateAccessTokenResult.token;
                    result.clientCookie.accessTokenExpireSecondTime = generateAccessTokenResult.expireTime;
                    const newAccessTokenValidateResult = verifyToken(generateAccessTokenResult.token, ACCESS);
                    result.clientResponse.accessTokenExpireUnixStampTime = newAccessTokenValidateResult.data['exp'];
                } else {
                    result.clientResponse.accessTokenExpireUnixStampTime = oldCookieAccessTokenValidateResult.data['exp'];
                }
            } else {
                const generateAccessTokenResult = await this.generateTokenAndStorageCache(
                    {
                        id: userValidateResult.user.id,
                    },
                    ACCESS,
                    userValidateResult
                );
                result.clientCookie.accessToken = generateAccessTokenResult.token;
                result.clientCookie.accessTokenExpireSecondTime = generateAccessTokenResult.expireTime;
                const newAccessTokenValidateResult = verifyToken(generateAccessTokenResult.token, ACCESS);
                result.clientResponse.accessTokenExpireUnixStampTime = newAccessTokenValidateResult.data['exp'];
            }
            result.clientResponse.id = userValidateResult.user.id;
            result.clientResponse.username = userValidateResult.user.username;
            result.clientResponse.email = userValidateResult.user.email;
            result.clientResponse.roles = userValidateResult.user.roles[0];
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Validate user identity, generate token payload and sign success response items
    validateUserIdentity = async (userFilterExpression) => {
        let result = {
            user: {
                id: '',
                username: '',
                password: '',
                email: '',
                roles: [],
                highestRolePermission: '',
                isActivate: false,
            },
            message: '',
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const userValidateResult = await this.unitOfWork.users.findOne(userFilterExpression);
            if (!userValidateResult) {
                throw new Error('User not found');
            }
            logInfo(`userValidateResult: ${stringify(userValidateResult)}`, fileDetails, true);

            const userRoles = await this.unitOfWork.roles.find({ _id: { $in: userValidateResult.roles } });
            const userRolesSortedByLevelDesc = userRoles.sort((a, b) => b.level > a.level);
            logInfo(`userRolesSortedByLevelDesc: ${stringify(userRolesSortedByLevelDesc)}`, fileDetails, true);
            // const userRolesName = userRoles.map((role) => 'ROLE_' + role.name.toUpperCase());
            const userRolesName = userRoles.map((role) => role.name);
            logInfo(`userRolesName: ${stringify(userRolesName)}`, fileDetails, true);

            result.user = {
                id: userValidateResult._id,
                username: userValidateResult.username,
                password: userValidateResult.password,
                email: userValidateResult.email,
                roles: userRolesName,
                highestRolePermission: userRolesName[0],
                isActivate: userValidateResult.isActivate,
            };
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    isExistsBlacklistToken = async (key, authType) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!key || !authType) {
                throw new Error('Token or auth type cannot be empty');
            }
            return await checkTokenExistsFromCache(key, authType);
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Generate token and stoarge to cache (redis), but only apply for access token and refresh token
    generateTokenAndStorageCache = async (payload, authType, userValidateResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let createResult = {
            token: null,
            expireTime: null,
        };
        try {
            if (!payload || !authType || !userValidateResult) {
                throw new Error('payload or authType userValidateResult is null.');
            }

            createResult = generateToken(payload, authType, userValidateResult.user.highestRolePermission);
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails, true);

            // if (!createResult.token || !createResult.expireTime) {
            //     throw new Error('Token create failed');
            // }

            // const cacheValue = {
            //     token: createResult.token,
            //     expireTime: createResult.expireTime,
            // };

            // // const isSetTokenToCache = await setTokenToCache(createResult.token, authType, userValidateResult.user.highestRolePermission);
            // const isSetTokenToCache = await setTokenToCache(
            //     authType,
            //     userValidateResult.user.id,
            //     stringify(cacheValue),
            //     userValidateResult.user.highestRolePermission
            // );
            // logInfo(`isSetTokenToCache: ${stringify(isSetTokenToCache)}`, fileDetails, true);

            // if (!isSetTokenToCache) {
            //     logError(`Set token to cache failed`, fileDetails, true);
            //     ///TODO: 未來必須要將錯誤寫入資料庫
            // }
            return createResult;
        } catch (err) {
            // logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Valiate access token, verify success response items, otherwise throw error
    verifyTokenValidity = async (token, authType) => {
        let result = {
            data: {},
            message: '',
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!token) {
                throw new Error('Token invalid');
            }
            if (!authType) {
                throw new Error('Auth type invalid');
            }
            result = verifyToken(token, authType);

            if (!result.data && result.message) {
                throw new Error(`Verify token failed, because ${stringify(result)}`);
            }
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Re-send confirm email
    reSendConfirmEmail = async (reSendConfirmEmailDto) => {
        let result = {
            isReSendConfirmEmail: false,
            message: '',
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            logInfo(stringify(reSendConfirmEmailDto), fileDetails);
            if (!reSendConfirmEmailDto || !reSendConfirmEmailDto.email) {
                throw new Error('Invalid email.');
            }

            const senderMailDto = {
                verifyType: EMAILCONFIRM,
                email: reSendConfirmEmailDto.email,
                subject: 'Confirm your email address',
                // text: `Click on this link to verify your email: ${process.env.SERVER_BASE_URL}/auth/${CONFIRMEMAILVERIFYACTION}?token=replacedToken`,
                text: `Click on this link to verify your email: ${process.env.CLIENT_BASE_URL}/${CONFIRMEMAILVERIFYACTION}?token=replacedToken&email=${reSendConfirmEmailDto.email}`,
            };

            const sendResult = await this.sendVerifyEmail(senderMailDto);

            if (!sendResult.isSendSuccess) {
                throw new Error(sendResult.message);
            }
            result.isReSendConfirmEmail = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Send verify email for reset password and email confirm
    sendVerifyEmail = async (senderMailDto) => {
        let result = {
            isSendSuccess: false,
            message: '',
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!senderMailDto) {
                throw new Error('Invalid verify token type.');
            }

            const tokenGenerateResult = generateToken(
                {
                    email: senderMailDto.email,
                },
                senderMailDto.verifyType,
                'user'
            );

            logInfo(`tokenGenerateResult: ${stringify(tokenGenerateResult)}`, fileDetails, true);

            if (!tokenGenerateResult || !tokenGenerateResult.token) {
                throw new Error('Token generate failed.');
            }

            const mailOptions = {
                from: process.env.EMAIL_SENDER,
                to: senderMailDto.email,
                subject: senderMailDto.subject,
                text: senderMailDto.text.replace('replacedToken', tokenGenerateResult.token),
            };

            await sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw new Error('Error sending verification email.');
                }
            });
            result.isSendSuccess = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Register user, success response items, otherwise throw error
    signup = async (registerDto) => {
        let userCreated = null;
        let registerResult = null;
        let result = {
            message: '',
            isRegisterSuccess: false,
            isSendConfirmEmailSuccess: false,
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!registerDto) {
                throw new Error('User cannot be empty');
            }

            logInfo(`registerDto: ${stringify(registerDto)}`, fileDetails, true);

            const roles = await this.unitOfWork.roles.find({ name: { $in: registerDto.roles } });

            if (!roles) {
                throw new Error('Roles cannot be found');
            }

            if (roles.length !== registerDto.roles.length) {
                throw new Error('Roles one or more cannot be found');
            }

            logInfo(`roles: ${stringify(roles)}`, fileDetails, true);

            const allowedNoEmailValidateRoles = ['admin', 'superadmin'];

            const isActivate = registerDto.roles.some((role) => allowedNoEmailValidateRoles.indexOf(role) !== -1);

            logInfo(`isActivate: ${isActivate}`, fileDetails, true);

            const registerUser = new User({
                username: registerDto.username,
                email: registerDto.email,
                password: bcrypt.hashSync(registerDto.password, 8),
                isActivate: isActivate,
            });

            userCreated = await this.unitOfWork.users.create(registerUser);

            if (!userCreated) {
                throw new Error('User cannot be created');
            }

            if (registerDto.roles && registerDto.roles.length > 0) {
                logInfo('multiple roles add to one user.', fileDetails);
                registerResult = await this.unitOfWork.users.addRoles(
                    userCreated._id,
                    roles.map((role) => role._id)
                );
                if (!registerResult) {
                    throw new Error('Roles cannot be added');
                }
                // logInfo(`registerResult: ${stringify(registerResult)}`, fileDetails, true);
            } else {
                logInfo('one role add to one user.', fileDetails);
                const role = await this.unitOfWork.roles.findOne({ name: 'user' });
                registerResult = await this.unitOfWork.users.addRole(userCreated._id, role._id);
            }

            if (!registerResult) {
                throw new Error('Register failed, please try again.');
            }

            result.isRegisterSuccess = true;

            if (!isActivate) {
                const senderMailDto = {
                    verifyType: EMAILCONFIRM,
                    email: registerResult.email,
                    subject: 'Confirm your email address',
                    // text: `Click on this link to verify your email: ${process.env.SERVER_BASE_URL}/auth/${CONFIRMEMAILVERIFYACTION}?token=replacedToken`,
                    text: `Click on this link to verify your email: ${process.env.CLIENT_BASE_URL}/${CONFIRMEMAILVERIFYACTION}?token=replacedToken&email=${registerResult.email}`,
                };

                const sendResult = await this.sendVerifyEmail(senderMailDto);

                if (!sendResult.isSendSuccess) {
                    throw new Error('Send register confirm email failed.');
                }
                result.isSendConfirmEmailSuccess = true;
            }
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Signin user, generate access token, store in redis cache, return items in success response, otherwise throw error
    signin = async (loginDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            clientResponse: {
                id: '',
                username: '',
                email: '',
                roles: [],
                accessTokenExpireUnixStampTime: 0,
            },
            clientCookie: {
                accessToken: '',
                accessTokenExpireSecondTime: 0,
                isAccessTokenExistsInCookie: false,
                refreshToken: '',
                refreshTokenExpireSecondTime: 0,
                isRefreshTokenExistsInCookie: false,
            },
            message: '',
        };

        try {
            if (!loginDto) {
                throw new Error('User cannot be empty');
            }
            logInfo(`loginDto: ${stringify(loginDto)}`, fileDetails, true);

            const userFilterExpression = {
                $or: [
                    {
                        username: loginDto.username,
                    },
                    {
                        email: loginDto.username,
                    },
                ],
            };

            const userValidateResult = await this.validateUserIdentity(userFilterExpression);

            if (userValidateResult.message) {
                throw new Error(userValidateResult.message);
            }

            const validatePassword = bcrypt.compareSync(loginDto.password, userValidateResult.user.password);

            if (!validatePassword) {
                throw new Error('Invalid password');
            }

            if (!userValidateResult.user.isActivate) {
                throw new Error('Email not activate, please check your mailbox, then click link activate account.');
            }

            ///TODO: 檢查 refresh 是否存在於 cookie
            ///TODO: 若存在，則驗證其 token 是否有效，若無效，則重新產生一組 token，並解析 token 獲取其逾期時間
            ///TODO: 若不存在，則重新產生一組 token，並解析 token 獲取其逾期時間
            if (loginDto.cookieRefreshToken) {
                result.clientCookie.isRefreshTokenExistsInCookie = true;
                const oldCookieRefreshTokenValidateResult = verifyToken(loginDto.cookieRefreshToken, REFRESH);
                // logInfo(
                //     `oldCookieRefreshTokenValidateResult: ${stringify(oldCookieRefreshTokenValidateResult)}`,
                //     fileDetails,
                //     true
                // );
                if (!oldCookieRefreshTokenValidateResult.data || oldCookieRefreshTokenValidateResult.message) {
                    const generateRefreshTokenResult = await this.generateTokenAndStorageCache(
                        {
                            id: userValidateResult.user.id,
                        },
                        REFRESH,
                        userValidateResult
                    );
                    result.clientCookie.refreshToken = generateRefreshTokenResult.token;
                    result.clientCookie.refreshTokenExpireSecondTime = generateRefreshTokenResult.expireTime;
                }
            } else {
                const generateRefreshTokenResult = await this.generateTokenAndStorageCache(
                    {
                        id: userValidateResult.user.id,
                    },
                    REFRESH,
                    userValidateResult
                );
                // logInfo(`generateRefreshTokenResult" ${stringify(generateRefreshTokenResult)}`, fileDetails);
                result.clientCookie.refreshToken = generateRefreshTokenResult.token;
                result.clientCookie.refreshTokenExpireSecondTime = generateRefreshTokenResult.expireTime;
            }

            // logInfo(`result.clientCookie: ${stringify(result.clientCookie)}`, fileDetails);

            ///TODO: 檢查 token 是否存在於 cookie
            ///TODO: 若存在，則驗證其 token 是否有效，若無效，則重新產生一組 token，並解析 token 獲取其逾期時間
            ///TODO: 若不存在，則重新產生一組 token，並解析 token 獲取其逾期時間
            if (loginDto.cookieAccessToken) {
                result.clientCookie.isAccessTokenExistsInCookie = true;
                const oldCookieAccessTokenValidateResult = verifyToken(loginDto.cookieAccessToken, ACCESS);
                // logInfo(
                //     `oldCookieAccessTokenValidateResult: ${stringify(oldCookieAccessTokenValidateResult)}`,
                //     fileDetails,
                //     true
                // );
                if (!oldCookieAccessTokenValidateResult.data || oldCookieAccessTokenValidateResult.message) {
                    const generateAccessTokenResult = await this.generateTokenAndStorageCache(
                        {
                            id: userValidateResult.user.id,
                        },
                        ACCESS,
                        userValidateResult
                    );
                    result.clientCookie.accessToken = generateAccessTokenResult.token;
                    result.clientCookie.accessTokenExpireSecondTime = generateAccessTokenResult.expireTime;
                    const newAccessTokenValidateResult = verifyToken(generateAccessTokenResult.token, ACCESS);
                    result.clientResponse.accessTokenExpireUnixStampTime = newAccessTokenValidateResult.data['exp'];
                } else {
                    result.clientResponse.accessTokenExpireUnixStampTime = oldCookieAccessTokenValidateResult.data['exp'];
                }
            } else {
                const generateAccessTokenResult = await this.generateTokenAndStorageCache(
                    {
                        id: userValidateResult.user.id,
                    },
                    ACCESS,
                    userValidateResult
                );
                result.clientCookie.accessToken = generateAccessTokenResult.token;
                result.clientCookie.accessTokenExpireSecondTime = generateAccessTokenResult.expireTime;
                const newAccessTokenValidateResult = verifyToken(generateAccessTokenResult.token, ACCESS);
                result.clientResponse.accessTokenExpireUnixStampTime = newAccessTokenValidateResult.data['exp'];
            }
            result.clientResponse.id = userValidateResult.user.id;
            result.clientResponse.username = userValidateResult.user.username;
            result.clientResponse.email = userValidateResult.user.email;
            result.clientResponse.roles = userValidateResult.user.roles[0];
            logInfo(`Result: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            // logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Signout user, remove access token and refresh token from redis cache, return items in success response, otherwise throw error
    signout = async (logoutDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        const result = {
            isAllowedLogout: true,
            message: null,
        };
        try {
            const isUserExists = await this.unitOfWork.users.findOne({
                username: logoutDto.username,
                email: logoutDto.email,
            });

            if (!isUserExists) {
                throw new Error('User not found');
            }

            const isDeletedAccessToken = await removeTokenFromCache(isUserExists._id, ACCESS);
            logInfo(`isDeletedAccessToken: ${stringify(isDeletedAccessToken)}`, fileDetails, true);

            const isDeletedRefreshToken = await removeTokenFromCache(isUserExists._id, REFRESH);
            logInfo(`isDeletedRefreshToken: ${stringify(isDeletedRefreshToken)}`, fileDetails, true);

            if (!isDeletedAccessToken || !isDeletedRefreshToken) {
                logInfo(`Delete token from cache failed`, fileDetails, true);
                ///TODO: 未來必須要將錯誤寫入資料庫
            }
            result.message = 'Logout success';
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Verify token of confirm email letter and parse token get user email, then check email whether or exists in database or not
    verifyEmail = async (verifyEmailDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isVerifyed: false,
            message: null,
        };

        try {
            if (!verifyEmailDto || !verifyEmailDto.token) {
                throw new Error('Token is required.');
            }

            const decodedToken = verifyToken(verifyEmailDto.token, EMAILCONFIRM);

            if (!decodedToken.data || decodedToken.message) {
                throw new Error(decodedToken.message);
            }

            const verifyedEmail = decodedToken.data['email'];
            const user = await this.unitOfWork.users.findOne({
                email: verifyedEmail,
            });

            if (!user) {
                throw new Error(`Verifyed failed, not found any ${verifyedEmail} record in database.`);
            }
            user.isActivate = true;
            user.save();
            result.isVerifyed = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Verify token of reset password letter and parse token get user email, then check email whether or exists in database or not
    verifyResetPasswordToken = async (verifyResetPasswordDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isVerifyed: false,
            resetUserEmail: '',
            message: '',
        };

        try {
            if (!verifyResetPasswordDto || !verifyResetPasswordDto.token) {
                throw new Error('Token is required.');
            }

            const decodedToken = verifyToken(verifyResetPasswordDto.token, RESETPASSWORD);

            if (!decodedToken.data || decodedToken.message) {
                throw new Error(decodedToken.message);
            }

            const verifyedEmail = decodedToken.data['email'];
            const user = await this.unitOfWork.users.findOne({
                email: verifyedEmail,
            });

            if (!user) {
                throw new Error(`Verifyed failed, not found any ${verifyedEmail} record in database.`);
            }
            result.resetUserEmail = user.email;
            result.isVerifyed = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Receive forget password body through email
    forgetPassword = async (applyResetPasswordDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isSendResetPasswordEmail: false,
            message: '',
        };

        try {
            if (!applyResetPasswordDto || !applyResetPasswordDto.email) {
                throw new Error('Email field is required.');
            }

            const senderMailDto = {
                verifyType: RESETPASSWORD,
                email: applyResetPasswordDto.email,
                subject: 'Reset password',
                // text: `Click on this link to reset your password: ${process.env.SERVER_BASE_URL}/auth/${RESETPASSWORDVERIFYACTION}?token=replacedToken`,
                text: `Click on this link to reset your password: ${process.env.CLIENT_BASE_URL}/${RESETPASSWORDVERIFYACTION}?token=replacedToken&email=${applyResetPasswordDto.email}`,
            };

            const sendResult = await this.sendVerifyEmail(senderMailDto);

            if (!sendResult.isSendSuccess) {
                throw new Error(sendResult.message);
            }
            result.isSendResetPasswordEmail = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Reset password through token, email and new password
    resetPassword = async (resetPasswordTokenDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isResetSuccess: false,
            message: '',
        };

        try {
            if (
                !resetPasswordTokenDto ||
                !resetPasswordTokenDto.token ||
                !resetPasswordTokenDto.email ||
                !resetPasswordTokenDto.newPassword
            ) {
                throw new Error('Invalid verify token or email or new password.');
            }

            const decodedToken = verifyToken(resetPasswordTokenDto.token, RESETPASSWORD);

            if (!decodedToken.data || decodedToken.message) {
                throw new Error(decodedToken.message);
            }

            const verifyedEmail = decodedToken.data['email'];

            logInfo(
                `verifyedEmail: ${verifyedEmail}, resetPasswordTokenDto.email: ${resetPasswordTokenDto.email}`,
                fileDetails
            );

            if (verifyedEmail !== resetPasswordTokenDto.email) {
                throw new Error(
                    `Reset password failed, because Token parsing email is different from form sending email.`
                );
            }

            const user = await this.unitOfWork.users.findOne({
                email: verifyedEmail,
            });

            if (!user) {
                throw new Error(`Reset password failed, not found any ${verifyedEmail} record in database.`);
            }

            const isAllowedResetPassword = bcrypt.compareSync(resetPasswordTokenDto.newPassword, user.password);

            if (isAllowedResetPassword) {
                throw new Error('Reset password failed, because new password with old password is same.');
            }
            user.password = bcrypt.hashSync(resetPasswordTokenDto.newPassword, 8);
            user.save();
            result.isResetSuccess = true;
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    ///TODO: Get current user info
    getCurrentUser = async (cookieAccessToken) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            id: '',
            username: '',
            email: '',
            roles: [],
            accessTokenExpireUnixStampTime: 0,
        };

        try {
            if (!cookieAccessToken) {
                // throw new Error('Access token does not empty.');
                throw new Error('Access token is required.');
            }

            logInfo(`token: ${cookieAccessToken}`, fileDetails, true);

            const accessTokenValidateResult = verifyToken(cookieAccessToken, ACCESS);

            logInfo(stringify(accessTokenValidateResult), fileDetails, true);

            if (!accessTokenValidateResult.data || accessTokenValidateResult.message) {
                throw new Error(accessTokenValidateResult.message);
            }

            const userId = accessTokenValidateResult.data['id'];

            if (!userId) {
                throw new Error('User id does not empty, access token analysis failed.');
            }

            const fkFields = { _id: 0, name: 1 };
            const userDetails = await this.findUserById(accessTokenValidateResult.data['id'], {}, fkFields);

            result.id = userDetails._id;
            result.username = userDetails.username;
            result.email = userDetails.email;
            result.roles = userDetails.roles[0]['name'];
            result.accessTokenExpireUnixStampTime = accessTokenValidateResult.data['exp'];
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };
}

module.exports = AuthService;
