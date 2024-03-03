const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/log.util.js');
const { filenameFilter } = require('../utils/regex.util.js');
const { set, setex, del, exists, get, mget } = require('../utils/cache.redis.util.js');
const { stringify } = require('./json.util');
const { 
    ACCESS, REFRESH, EMAILCONFIRM, RESETPASSWORD, AUTHTYPELIST,
    ADMINROLEPERMISSION, DEVELOPMENTROLEPERMISSION, MODERATORROLEPERMISSION,
    USERROLEPERMISSION
} = require('../config/auth.type.config.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
let fileDetails = `[${filenameWithoutPath}]`;


const JWTUtil = {
    getCacheTokenKey: (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [getCacheTokenKey]`;
        try {
            const isValidate = JWTUtil.checkAnalyzeTokenItems(key, authType);
            if (!isValidate.isValid) {
                throw new Error(isValidate.message);
            }
            return `${authType}:${key}`;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    getPrivateKey: (authType) => {
        fileDetails = `[${filenameWithoutPath}] [getPrivateKey]`;
        try {
            if (authType === ACCESS) {
                return process.env.JWT_ACCESS_TOKEN_SECRET;
            } else if (authType === REFRESH) {
                return process.env.JWT_REFRESH_TOKEN_SECRET;
            } else if ([EMAILCONFIRM, RESETPASSWORD].includes(authType)) {
                return process.env.JWT_CONFIRM_AND_RESET_TOKEN_SECRET;
            } else {
                throw new Error(`Invalid auth type: ${authType}`);
            }
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    getAccessTokenExpireTime: (roleHighestPermission) => {
        fileDetails = `[${filenameWithoutPath}] [getAccessTokenExpireTime]`;
        try {
            switch (roleHighestPermission) {
                case ADMINROLEPERMISSION:
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_ADMIN;
                case DEVELOPMENTROLEPERMISSION:
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_DEV;
                case MODERATORROLEPERMISSION:
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_USER;
                case USERROLEPERMISSION:
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_USER;
                default:
                    throw new Error(`Invalid role highest permission: ${roleHighestPermission}`);
            }
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    getTokenExpireTime: (authType, roleHighestPermission) => {
        fileDetails = `[${filenameWithoutPath}] [getTokenExpireTime]`;
        try {
            switch (authType) {
                case ACCESS:
                    return JWTUtil.getAccessTokenExpireTime(roleHighestPermission);
                case REFRESH:
                    return process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME;
                case EMAILCONFIRM:
                    return process.env.JWT_EMAIL_CONFIRM_TOKEN_EXPIRE_TIME;
                case RESETPASSWORD:
                    return process.env.JWT_FORGET_PASSWORD_TOKEN_EXPIRE_TIME;
                default:
                    throw new Error(`Invalid auth type: ${authType}`);
            }
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    checkAnalyzeTokenItems: (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [checkAnalyzeTokenItems]`;
        let result = {
            isValid: true,
            message: null,
        };
        try {
            if (!key) {
                result = {
                    isValid: false,
                    message: 'Token cannot be empty',
                };
            }
            if (!authType) {
                result = {
                    isValid: false,
                    message: 'Auth type cannot be empty',
                };
            }
            if (!AUTHTYPELIST.includes(authType)) {
                result = {
                    isValid: false,
                    message: 'Invalid auth type',
                };
            }
        } catch (err) {
            result = {
                isValid: false,
                message: err.message,
            };
            logError(err, fileDetails, true);
        }
        return result;
    },
    verifyToken: (token, authType) => {
        fileDetails = `[${filenameWithoutPath}] [verifyToken]`;
        let result = {
            data: {},
            message: ''
        };
        try {
            if (!token) {
                throw new Error('Token invalid');
            }
            const privateKey = JWTUtil.getPrivateKey(authType);

            if (!privateKey) {
                throw new Error('Private token get failed');
            }
            result.data = jwt.verify(token, privateKey);
        } catch (err) {
            logError(err, fileDetails, true);
            result.message = err.message;
        }
        return result;
    },
    checkGenerateTokenItems: (payload, authType) => {
        fileDetails = `[${filenameWithoutPath}] [checkGenerateTokenItems]`;
        let result = {
            isValid: true,
            message: null,
        };
        try {
            if (!payload) {
                result = {
                    isValid: false,
                    message: 'Payload cannot be empty',
                };
            }
            if (!authType) {
                result = {
                    isValid: false,
                    message: 'Auth type cannot be empty',
                };
            }
            if (!AUTHTYPELIST.includes(authType)) {
                result = {
                    isValid: false,
                    message: `Invaild auth type: ${authType}`,
                };
            }
        } catch (err) {
            result = {
                isValid: false,
                message: err.message,
            };
            logError(err, fileDetails, true);
        }
        return result;
    },
    generateToken: (payload, authType, roleHighestPermission) => {
        fileDetails = `[${filenameWithoutPath}] [generateToken]`;
        let result = {
            token: null,
            expireTime: null,
        };
        try {
            const isValidate = JWTUtil.checkGenerateTokenItems(payload, authType);

            if (!isValidate.isValid) {
                throw new Error(isValidate.message);
            }

            logInfo(`payload: ${JSON.stringify(payload)}`, fileDetails, true);

            const privateKey = JWTUtil.getPrivateKey(authType);

            logInfo(`privateKey: ${privateKey}`, fileDetails, true);

            if (!privateKey) {
                throw new Error('Private key get failed');
            }

            const expireTime = parseInt(JWTUtil.getTokenExpireTime(authType, roleHighestPermission));

            if (expireTime <= 0) {
                throw new Error('Invalid expire time, obtained failed');
            }

            result = {
                token: jwt.sign(payload, privateKey, { expiresIn: expireTime }),
                expireTime: expireTime,
            };
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return result;
    },
    removeTokenFromCache: async (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [removeTokenFromCache]`;
        let isRemoved = false;
        try {
            const cacheTokenKey = JWTUtil.getCacheTokenKey(key, authType);
            isRemoved = (await del(cacheTokenKey)) === 1;
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return isRemoved;
    },
    checkTokenExistsFromCache: async (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [checkTokenExistsFromCache]`;
        try {
            const cacheTokenKey = JWTUtil.getCacheTokenKey(key, authType);
            const isExists = await exists(cacheTokenKey);
            return isExists;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    setTokenToCache: async (authType, key, value, roleHighestPermission) => {
        fileDetails = `[${filenameWithoutPath}] [setTokenToCache]`;
        let isSet = false;
        try {
            const cacheTokenKey = JWTUtil.getCacheTokenKey(key, authType);
            const expireTime = JWTUtil.getTokenExpireTime(authType, roleHighestPermission);
            isSet = (await setex(cacheTokenKey, expireTime, value)) === 'OK';
            return isSet;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    getTokenFromCache: async (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [getTokenFromCache]`;
        try {
            const cacheTokenKey = JWTUtil.getCacheTokenKey(key, authType);
            const value = await get(cacheTokenKey);

            if (!value) {
                throw new Error('Token not exists');
            }
            return value;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
    decodeToken: (token) => {
        fileDetails = `[${filenameWithoutPath}] [decodeToken]`;
        let result = null;
        try {
            result = jwt.decode(token);
            // logInfo(stringify(result), fileDetails, true);
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return result;
    },
};

module.exports = JWTUtil;
