var bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../../utils/log.util');
const { stringify, parse } = require('../../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util');

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

    findUserById = async (id) => {
        if (!id) {
            throw new Error('User id cannot be empty.');
        }
        return await this.unitOfWork.users.findById(id);
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
        const classNameAndFuncName = getFunctionCallerName();
        const fileDetails = getFileDetails(classNameAndFuncName);
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

    refreshToken = async (token) => {
        const classNameAndFuncName = getFunctionCallerName();
        const fileDetails = getFileDetails(classNameAndFuncName);
        let createAccessTokenResult = {
            token: null,
            expireTime: null,
        };
        try {
            if (!token) {
                throw new Error('Refresh token cannot be empty');
            }

            const refreshTokenValidateResult = verifyToken(token, 'refresh');
            logInfo(`refreshTokenValidateResult: ${stringify(refreshTokenValidateResult)}`, fileDetails, true);

            if (!refreshTokenValidateResult) {
                throw new Error('Token was not verified successfully!');
            }

            const isAccessTokenExistsInCache = await checkTokenExistsFromCache(refreshTokenValidateResult.id, 'access');

            logInfo(`isAccessTokenExistsInCache: ${stringify(isAccessTokenExistsInCache)}`, fileDetails, true);

            if (isAccessTokenExistsInCache) {
                const cacheAccessTokenItems = parse(await getTokenFromCache(refreshTokenValidateResult.id, 'access'));
                logInfo(
                    `Get old access token from redis cache: ${stringify(cacheAccessTokenItems)}`,
                    fileDetails,
                    true
                );

                if (cacheAccessTokenItems) {
                    createAccessTokenResult.token = cacheAccessTokenItems.token;
                    createAccessTokenResult.expireTime = cacheAccessTokenItems.expireTime;
                    return createAccessTokenResult;
                }
            }

            const userValidateResult = await this.validateUserIdentity({ _id: refreshTokenValidateResult.id });

            if (!userValidateResult) {
                throw new Error('User not found');
            }

            const payload = {
                id: userValidateResult.id,
            };

            createAccessTokenResult = await this.generateTokenAndStorageCache(payload, 'access', userValidateResult);

            if (!createAccessTokenResult) {
                throw new Error('Access token create failed');
            }
            return createAccessTokenResult;
        } catch (err) {
            // logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Validate user identity, generate token payload and sign success response items
    validateUserIdentity = async (userFilterExpression) => {
        let result = null;
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

            result = {
                id: userValidateResult._id,
                username: userValidateResult.username,
                password: userValidateResult.password,
                email: userValidateResult.email,
                roles: userRolesName,
                highestRolePermission: userRolesName[0],
            };
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            // logError(err, fileDetails, true);
            throw err;
        }
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
            // logError(err, fileDetails, true);
            throw err;
        }
    };

    generateTokenAndStorageCache = async (payload, authType, userValidateResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let createResult = {
            token: null,
            expireTime: null,
        };
        try {
            createResult = generateToken(payload, authType, userValidateResult.highestRolePermission);
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails, true);

            if (!createResult.token || !createResult.expireTime) {
                throw new Error('Token create failed');
            }

            const cacheValue = {
                token: createResult.token,
                expireTime: createResult.expireTime,
            };

            // const isSetTokenToCache = await setTokenToCache(createResult.token, authType, userValidateResult.highestRolePermission);
            const isSetTokenToCache = await setTokenToCache(
                authType,
                userValidateResult.id,
                stringify(cacheValue),
                userValidateResult.highestRolePermission
            );
            logInfo(`isSetTokenToCache: ${stringify(isSetTokenToCache)}`, fileDetails, true);

            if (!isSetTokenToCache) {
                logError(`Set token to cache failed`, fileDetails, true);
                ///TODO: 未來必須要將錯誤寫入資料庫
            }
            return createResult;
        } catch (err) {
            // logError(err, fileDetails, true);
            createResult = {};
        }
        return createResult;
    };

    ///TODO: Valiate access token, verify success response items, otherwise throw error
    verifyTokenValidity = async (token, authType) => {
        let result = {};
        const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!token) {
                throw new Error('Token invalid');
            }
            if (!authType) {
                throw new Error('Auth type invalid');
            }
            result = verifyToken(token, authType);
            return result;
        } catch (err) {
            // logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Register user, success response items, otherwise throw error
    signup = async (user) => {
        let userCreated = null;
        let result = null;
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!user) {
                throw new Error('User cannot be empty');
            }

            logInfo(`user: ${stringify(user)}`, fileDetails, true);

            const roles = await this.unitOfWork.roles.find({ name: { $in: user.roles } });

            if (!roles) {
                throw new Error('Roles cannot be found');
            }

            if (roles.length !== user.roles.length) {
                throw new Error('Roles one or more cannot be found');
            }

            logInfo(`roles: ${stringify(roles)}`, fileDetails, true);

            const registerUser = new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 8),
            });

            userCreated = await this.unitOfWork.users.create(registerUser);

            if (!userCreated) {
                throw new Error('User cannot be created');
            }

            if (user.roles && user.roles.length > 0) {
                result = await this.unitOfWork.users.addRoles(
                    userCreated._id,
                    roles.map((role) => role._id)
                );
                if (!result) {
                    throw new Error('Roles cannot be added');
                }
                logInfo(`result: ${stringify(result)}`, fileDetails, true);
            } else {
                const role = await this.unitOfWork.roles.findOne({ name: 'user' });
                result = await this.unitOfWork.users.addRole(userCreated._id, role._id);
            }
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Signin user, generate access token, store in redis cache, return items in success response, otherwise throw error
    signin = async (loginDto) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        let result = {
            clientResponse: null,
            clientCookie: null,
        };

        try {
            if (!loginDto) {
                throw new Error('User cannot be empty');
            }
            logInfo(`loginDto: ${stringify(loginDto)}`, fileDetails, true);

            const userFilterExpression = {
                username: loginDto.username,
            };

            const userValidateResult = await this.validateUserIdentity(userFilterExpression);

            if (!userValidateResult) {
                throw new Error('User not found');
            }

            const validatePassword = bcrypt.compareSync(loginDto.password, userValidateResult.password);

            if (!validatePassword) {
                throw new Error('Invalid password');
            }

            let createAccessTokenResult = {
                token: null,
                expireTime: null,
            };

            let createRefreshTokenResult = {
                token: null,
                expireTime: null,
            };

            const payload = {
                id: userValidateResult.id,
            };

            let isTokenExistsInCookie = {
                accessToken: false,
                refreshToken: false,
            };

            ///TODO: 檢查存放在 cookie 中 access token 是否為空，如果不為空，則進行驗證，如果驗證失敗，則重新產生 access token
            ///TODO: 反之，視為第一次登入，產生 access token
            if (loginDto.cookieAccessToken) {
                isTokenExistsInCookie.accessToken = true;
                const isVerifyAccessToken = verifyToken(loginDto.cookieAccessToken, 'access');
                logInfo(`isVerifyAccessToken: ${stringify(isVerifyAccessToken)}`, fileDetails, true);
                if (!isVerifyAccessToken) {
                    logInfo(`isVerifyAccessToken is false`, fileDetails, true);
                    createAccessTokenResult = await this.generateTokenAndStorageCache(
                        payload,
                        'access',
                        userValidateResult
                    );
                } else {
                    logInfo(`isVerifyAccessToken is true`, fileDetails, true);
                    createAccessTokenResult.token = loginDto.cookieAccessToken;
                }
            } else {
                isTokenExistsInCookie.accessToken = false;
                const isExistsBlacklistToken = await this.isExistsBlacklistToken(userValidateResult.id, 'access');
                logInfo(`isExistsBlacklistToken: ${stringify(isExistsBlacklistToken)}`, fileDetails, true);
                if (!isExistsBlacklistToken) {
                    logInfo(`isExistsBlacklistToken is false`, fileDetails, true);
                    createAccessTokenResult = await this.generateTokenAndStorageCache(
                        payload,
                        'access',
                        userValidateResult
                    );
                } else {
                    logInfo(`isExistsBlacklistToken is true`, fileDetails, true);
                    // createAccessTokenResult.token = await getTokenFromCache(userValidateResult.id, 'access');
                    const cacheAccessTokenItems = parse(await getTokenFromCache(userValidateResult.id, 'access'));
                    createAccessTokenResult.token = cacheAccessTokenItems.token;
                    createAccessTokenResult.expireTime = cacheAccessTokenItems.expireTime;
                }
            }

            if (!createAccessTokenResult && !loginDto.cookieAccessToken) {
                throw new Error('Access token create failed');
            }

            logInfo(`createAccessTokenResult: ${stringify(createAccessTokenResult)}`, fileDetails, true);

            ///TODO: Check refresh token exists in cookie, if exists, then verify refresh token,
            ///TODO: Otherwise will be as first time login, Check refresh token exists in blacklist (redis cache)
            if (loginDto.cookieRefreshToken) {
                isTokenExistsInCookie.refreshToken = true;
                const isVerifyRefreshToken = verifyToken(loginDto.cookieRefreshToken, 'refresh');
                logInfo(`isVerifyRefreshToken: ${stringify(isVerifyRefreshToken)}`, fileDetails, true);
                if (!isVerifyRefreshToken) {
                    logInfo(`isVerifyRefreshToken is false`, fileDetails, true);
                    createRefreshTokenResult = await this.generateTokenAndStorageCache(
                        payload,
                        'refresh',
                        userValidateResult
                    );
                } else {
                    logInfo(`isVerifyRefreshToken is true`, fileDetails, true);
                    createRefreshTokenResult.token = loginDto.cookieRefreshToken;
                }
            } else {
                isTokenExistsInCookie.refreshToken = false;
                const isExistsBlacklistToken = await this.isExistsBlacklistToken(userValidateResult.id, 'refresh');
                logInfo(`isExistsBlacklistToken: ${stringify(isExistsBlacklistToken)}`, fileDetails, true);
                ///TODO: Check refresh token exists in blacklist (redis cache)
                ///TODO: If exists, then generate new refresh token, otherwise return old refresh token from redis cache
                if (!isExistsBlacklistToken) {
                    logInfo(`isExistsBlacklistToken is false`, fileDetails, true);
                    createRefreshTokenResult = await this.generateTokenAndStorageCache(
                        payload,
                        'refresh',
                        userValidateResult
                    );
                } else {
                    logInfo(`isExistsBlacklistToken is true`, fileDetails, true);
                    // createRefreshTokenResult.token = await getTokenFromCache(userValidateResult.id, 'refresh');
                    const cacheRefreshTokenItems = parse(await getTokenFromCache(userValidateResult.id, 'refresh'));
                    createRefreshTokenResult.token = cacheRefreshTokenItems.token;
                    createRefreshTokenResult.expireTime = cacheRefreshTokenItems.expireTime;
                }
            }

            if (!createRefreshTokenResult && !loginDto.cookieRefreshToken) {
                throw new Error('Refresh token create failed');
            }

            logInfo(`createRefreshTokenResult: ${stringify(createRefreshTokenResult)}`, fileDetails, true);

            result.clientResponse = {
                id: userValidateResult.id,
                username: userValidateResult.username,
                email: userValidateResult.email,
                roles: userValidateResult.roles,
            };

            result.clientCookie = {
                accessToken: createAccessTokenResult.token,
                accessTokenExpireTime: createAccessTokenResult.expireTime,
                isAccessTokenExistsInCookie: isTokenExistsInCookie.accessToken,
                refreshToken: createRefreshTokenResult.token,
                refreshTokenExpireTime: createRefreshTokenResult.expireTime,
                isRefreshTokenExistsInCookie: isTokenExistsInCookie.refreshToken,
            };
            logInfo(`loginSuccessResult: ${stringify(result)}`, fileDetails, true);
        } catch (err) {
            // logError(err, fileDetails, true);
            result = {};
        }
        return result;
    };

    traceErrorAndWriteDB = async (err) => {
        logError(err, true);
        await this.unitOfWork.errors.create({
            message: err.message,
            stack: err.stack,
            createdAt: new Date(),
        });
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

            const isDeletedAccessToken = await removeTokenFromCache(isUserExists._id, 'access');
            logInfo(`isDeletedAccessToken: ${stringify(isDeletedAccessToken)}`, fileDetails, true);

            const isDeletedRefreshToken = await removeTokenFromCache(isUserExists._id, 'refresh');
            logInfo(`isDeletedRefreshToken: ${stringify(isDeletedRefreshToken)}`, fileDetails, true);

            if (!isDeletedAccessToken || !isDeletedRefreshToken) {
                logError(`Delete token from cache failed`, fileDetails, true);
                ///TODO: 未來必須要將錯誤寫入資料庫
            }
            result.message = 'Logout success';
        } catch (err) {
            // logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };
}

module.exports = AuthService;
