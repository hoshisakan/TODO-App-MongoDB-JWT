const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/log.util.js');
const { filenameFilter } = require('../utils/regex.util.js');
const { set, setex, del, exists, get, mget } = require('../utils/cache.redis.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
let fileDetails = `[${filenameWithoutPath}]`;

const authTypeList = ['access', 'refresh'];

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
            switch (authType) {
                case 'access':
                    return process.env.JWT_ACCESS_TOKEN_SECRET;
                case 'refresh':
                    return process.env.JWT_REFRESH_TOKEN_SECRET;
                default:
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
                case 'admin':
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_ADMIN;
                case 'moderator':
                    return process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_FOR_USER;
                case 'user':
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
                case 'access':
                    return JWTUtil.getAccessTokenExpireTime(roleHighestPermission);
                case 'refresh':
                    return process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME;
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
            if (!authTypeList.includes(authType)) {
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
        let result = null;
        try {
            if (!token) {
                throw new Error('Token invalid');
            }
            const privateKey = JWTUtil.getPrivateKey(authType);
            if (!privateKey) {
                throw new Error('Private token obtained failed');
            }
            const params = {
                token: token,
                privateKey: privateKey,
            };
            logInfo(`verifyToken params: ${JSON.stringify(params)}`, fileDetails, true);
            result = jwt.verify(token, privateKey);
        } catch (err) {
            logError(err, fileDetails, true);
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
            if (!authTypeList.includes(authType)) {
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
                throw new Error('Private key obtained failed');
            }

            const expireTime = parseInt(JWTUtil.getTokenExpireTime(authType, roleHighestPermission));

            if (expireTime <= 0) {
                throw new Error('Invalid expire time, obtained failed');
            }

            result = {
                token: jwt.sign(payload, privateKey, { expiresIn: expireTime }),
                expireTime: expireTime,
            };

            // const decoded = jwt.verify(result.token, privateKey);
            // logInfo(`decoded: ${JSON.stringify(decoded)}`, fileDetails, true);
        } catch (err) {
            logError(err, fileDetails, true);
        }
        return result;
    },
    removeTokenFromCache: async (key, authType) => {
        fileDetails = `[${filenameWithoutPath}] [removeTokenFromCache]`;
        try {
            const cacheTokenKey = JWTUtil.getCacheTokenKey(key, authType);

            const isDeleted = await del(cacheTokenKey);

            if (!isDeleted) {
                throw new Error('Token delete failed');
            }
            return true;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
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
};

module.exports = JWTUtil;
