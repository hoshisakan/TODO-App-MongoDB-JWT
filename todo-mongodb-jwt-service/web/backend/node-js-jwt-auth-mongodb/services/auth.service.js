var bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../utils/log.util');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util');
// const { set, setex, get, exists } = require('../utils/cache.redis.util');

const { generateToken, verifyTokenExistsInCache, verifyToken, getTokenInCache, getCacheTokenKey, storeTokensInCache } = require('../utils/jwt.util');
const UnitOfWork = require('../repositories/unitwork');
const User = require('../models/mongodb/user.model');
const { log } = require('winston');
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

        if (!isDesc) {
            return await this.unitOfWork.roles
                .find({
                    _id: { $in: user.roles },
                })
                .then((roles) => {
                    return roles.sort((a, b) => a.level < b.level);
                });
        } else {
            return await this.unitOfWork.roles
                .find({
                    _id: { $in: user.roles },
                })
                .then((roles) => {
                    return roles.sort((a, b) => b.level > a.level);
                });
        }
    };

    ///TODO: Generate access token with expiration time, store in redis cache with expiration time, return token
    generateAccessToken = async (payload, highestRole) => {
        let result = {
            accessToken: null,
            cacheResult: null,
            isAccessTokenExpired: false,
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!payload) {
                throw new Error('User cannot be empty');
            }
            if (!highestRole) {
                throw new Error('Highest role cannot be empty');
            }

            logInfo(`payload: ${stringify(payload)}`, fileDetails, true);
            logInfo(`highestRole: ${highestRole}`, fileDetails, true);

            const isTokenExistsInCache = await verifyTokenExistsInCache(payload._id, 'access');
            logInfo(`isTokenExistsInCache: ${isTokenExistsInCache}`, fileDetails, true);

            if (!isTokenExistsInCache) {
                let accessToken = null;
                let tokenExpirationTime = null;

                switch (highestRole) {
                    case 'admin':
                        tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_ADMIN, 10);
                        break;
                    case 'moderator':
                        tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_MODERATOR, 10);
                        break;
                    case 'user':
                        tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_USER, 10);
                        break;
                    default:
                        throw new Error('Role name is invalid');
                }

                if (tokenExpirationTime === -1) {
                    throw new Error('Token expiration time is invalid');
                }
                logInfo(`tokenExpirationTime: ${tokenExpirationTime}`, fileDetails, true);

                accessToken = generateToken(payload, tokenExpirationTime, 'access');

                if (!accessToken) {
                    throw new Error('Access token generation failed');
                }
                result.accessToken = accessToken;
                result.cacheResult = await storeTokensInCache(payload._id, accessToken, 'access');

                if (!result.cacheResult || result.cacheResult !== 'OK') {
                    throw new Error('Set access token in cache failed');
                }
                result.isAccessTokenExpired = true;
            } else {
                result.accessToken = await getTokenInCache(payload._id, 'access');

                if (!result.accessToken) {
                    throw new Error('Get access token from cache failed');
                }
                result.cacheResult = 'OK';
                result.isAccessTokenExpired = false;
            }
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

    ///TODO: Generate refresh token with expiration time, store in redis cache with expiration time, return token
    generateRefreshToken = async (payload) => {
        let result = {
            refreshToken: null,
            cacheResult: null,
            isRefreshTokenExpired: false,
        };
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!payload) {
                throw new Error('Payload cannot be empty');
            }

            logInfo(`payload: ${stringify(payload)}`, fileDetails, true);

            const isTokenExistsInCache = await verifyTokenExistsInCache(payload._id, 'refresh');

            logInfo(`isTokenExistsInCache: ${isTokenExistsInCache}`, fileDetails, true);

            if (!isTokenExistsInCache) {
                let refreshToken = null;
                let tokenExpirationTime = null;

                tokenExpirationTime = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME, 10);

                if (tokenExpirationTime === -1) {
                    throw new Error('Token expiration time is invalid');
                }
                logInfo(`tokenExpirationTime: ${tokenExpirationTime}`, fileDetails, true);

                refreshToken = generateToken(payload, tokenExpirationTime, 'refresh');

                if (!refreshToken) {
                    throw new Error('Refresh token generation failed');
                }
                result.refreshToken = refreshToken;
                result.cacheResult = await storeTokensInCache(payload._id, refreshToken, 'refresh');

                if (!result.cacheResult || result.cacheResult !== 'OK') {
                    throw new Error('Set refresh token in cache failed');
                }
                result.isRefreshTokenExpired = false;
            } else {
                result.refreshToken = await getTokenInCache(payload._id, 'refresh');

                if (!result.refreshToken) {
                    throw new Error('Get refresh token from cache failed');
                }
                result.cacheResult = 'OK';
                result.isRefreshTokenExpired = false;
            }
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
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
                _id: userValidateResult._id,
                username: userValidateResult.username,
                password: userValidateResult.password,
                email: userValidateResult.email,
                roles: userRolesName,
                highestRole: userRolesName[0],
            };
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

    refreshToken = async (validateToken) => {
        let result = false;
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!validateToken) {
                throw new Error('Token cannot be empty');
            }

            const checkTokenExistsKey = `refreshToken:${validateToken}`;
            logInfo(`checkTokenExistsKey: ${checkTokenExistsKey}`, fileDetails, true);

            const isTokenExistsInCache = await verifyTokenExistsInCache(validateToken);
            logInfo(`isTokenExistsInCache: ${isTokenExistsInCache}`, fileDetails, true);

            if (!isTokenExistsInCache) {
                throw new Error('Token does not exist in cache');
            }

            const decoded = verifyToken(validateToken, 'refresh');
            logInfo(`decoded: ${stringify(decoded)}`, fileDetails, true);

            if (!decoded) {
                throw new Error('Token is invalid');
            }

            const validateUserId = decoded.id;
            logInfo(`validateUserId: ${validateUserId}`, fileDetails, true);

            const userValidateResult = await this.validateUserIdentity({ _id: validateUserId });
            logInfo(`user: ${stringify(userValidateResult)}`, fileDetails, true);

            if (!userValidateResult) {
                throw new Error('User not found');
            }

            const newAccessToken = generateToken(userValidateResult, 'access');

            if (!newAccessToken) {
                throw new Error('New access token generation failed');
            }

            result = {
                clientResponse: {
                    id: userValidateResult.id,
                    username: userValidateResult.username,
                    email: userValidateResult.email,
                    roles: userValidateResult.roles,
                    accessToken: newAccessToken,
                },
            };
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };

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
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
        return result;
    };

    signin = async (user, cookieRefreshToken) => {
        let result = null;
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            if (!user) {
                throw new Error('User cannot be empty');
            }
            logInfo(`signin username: ${user.username}`, fileDetails, true);

            if (!cookieRefreshToken) {
                throw new Error('Refresh token cannot be empty');
            }

            logInfo(`signin cookieRefreshToken: ${cookieRefreshToken}`, fileDetails, true);

            const userFilterExpression = {
                username: user.username,
            };

            const userValidateResult = await this.validateUserIdentity(userFilterExpression);

            if (!userValidateResult) {
                throw new Error('User not found');
            }

            const validatePassword = bcrypt.compareSync(user.password, userValidateResult.password);

            if (!validatePassword) {
                throw new Error('Invalid password');
            }

            const tokenPayload = {
                _id: userValidateResult._id,
            };

            const accessTokenCreatedResult = await this.generateAccessToken(
                tokenPayload,
                userValidateResult.highestRole
            );

            if (!accessTokenCreatedResult) {
                throw new Error('Access token creation failed');
            }

            const accessToken = accessTokenCreatedResult.accessToken;

            if (!accessToken) {
                throw new Error('Access token cannot be empty');
            }

            if (accessTokenCreatedResult.cacheResult !== 'OK') {
                throw new Error('Access token cannot be cached');
            }

            const isAccessTokenExpired = accessTokenCreatedResult.isAccessTokenExpired;

            logInfo(`isAccessTokenExpired: ${isAccessTokenExpired}`, fileDetails, true);

            const refreshTokenCreatedResult = await this.generateRefreshToken(tokenPayload);

            if (!refreshTokenCreatedResult) {
                throw new Error('Refresh token creation failed');
            }

            const refreshToken = refreshTokenCreatedResult.refreshToken;

            if (!refreshToken) {
                throw new Error('Refresh token cannot be empty');
            }

            if (refreshTokenCreatedResult.cacheResult !== 'OK') {
                throw new Error('Refresh token cannot be cached');
            }

            const isRefreshTokenExpired = refreshTokenCreatedResult.isRefreshTokenExpired;

            result = {
                clientResponse: {
                    id: userValidateResult.id,
                    username: userValidateResult.username,
                    email: userValidateResult.email,
                    roles: userValidateResult.roles,
                    accessToken: accessToken,
                    // isAccessTokenExpired: isAccessTokenExpired,
                },
                clientCookie: {
                    refreshToken: refreshToken,
                    isRefreshTokenExpired: isRefreshTokenExpired, ///TODO: If refresh token is expired, client should redirect to login page, otherwise, client should set refresh token in cookie and redirect to home page
                },
            };
            logInfo(`signin result: ${stringify(result)}`, fileDetails, true);
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    };
}

module.exports = AuthService;
