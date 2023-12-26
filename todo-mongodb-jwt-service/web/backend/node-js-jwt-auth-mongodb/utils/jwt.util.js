const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/log.util.js');
const { filenameFilter } = require('../utils/regex.util.js');
const { set, setex, del, exists, get, mget } = require('../utils/cache.redis.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const fileDetails = `[${filenameWithoutPath}]`;

const JWTUtil = {
    getCacheTokenKey: (userId, authType) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }
            return `${authType}Token:${userId}`;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    storeTokensInCache: async (userId, token, authType, expirationTime) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!token) {
                throw new Error('Token cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }
            if (authType !== 'access' && authType !== 'refresh') {
                throw new Error('Invalid auth type');
            }
            if (authType == 'access' && !expirationTime) {
                throw new Error('Expiration time cannot be empty');
            }

            logInfo(`userId: ${userId}`, fileDetails, true);
            logInfo(`token: ${token}`, fileDetails, true);
            logInfo(`authType: ${authType}`, fileDetails, true);

            const cacheKey = JWTUtil.getCacheTokenKey(userId, authType);
            logInfo(`cacheKey: ${cacheKey}`, fileDetails, true);
            let tokenExpirationTime = null;
            
            if (authType === 'access') {
                tokenExpirationTime = parseInt(expirationTime, 10);
            } else if (authType === 'refresh') {
                tokenExpirationTime = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME, 10);
            }

            if (authType === 'refresh' && !tokenExpirationTime || tokenExpirationTime <= 0) {
                throw new Error('Token expiration time cannot be empty');
            }
            logInfo(`tokenExpirationTime: ${tokenExpirationTime}`, fileDetails, true);

            result = await setex(cacheKey, tokenExpirationTime, token);
            logInfo(`storeTokensInCache result: ${result}`, fileDetails, true);

            if (result !== 'OK') {
                throw new Error('Failed to set the value in the cache.');
            }
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    revokeTokensInCache: async (userId, authType) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }

            const cacheKey = JWTUtil.getCacheTokenKey(userId, authType);
            logInfo(`cacheKey: ${cacheKey}`, fileDetails, true);

            const result = await del(cacheKey);
            logInfo(`revokeTokensInCache result: ${result}`, fileDetails, true);

            if (result !== 1) {
                throw new Error('Failed to delete the value in the cache.');
            }
            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    verifyTokenExistsInCache: async (userId, authType) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }

            const cacheKeys = JWTUtil.getCacheTokenKey(userId, authType);
            logInfo(`cacheKeys: ${cacheKeys}`, fileDetails, true);

            const result = await exists(cacheKeys);
            logInfo(`verifyTokenExistsInCache result: ${result}`, fileDetails, true);

            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    verifyTokensExistInCache: async (userId, authType) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }
            const cacheKeys = [JWTUtil.getCacheTokenKey(userId, 'access'), JWTUtil.getCacheTokenKey(userId, 'token')];
            logInfo(`cacheKeys: ${cacheKeys}`, fileDetails, true);

            const result = (await exists(cacheKeys)) === 1;
            logInfo(`verifyTokensExistInCache result: ${result}`, fileDetails, true);

            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    getTokenInCache: async (userId, authType) => {
        try {
            if (!userId) {
                throw new Error('User ID cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }
            const cacheKey = `${authType}Token:${userId}`;
            logInfo(`cacheKey: ${cacheKey}`, fileDetails, true);

            const result = await get(cacheKey);
            logInfo(`getTokensInCache result: ${result}`, fileDetails, true);

            return result;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    isTokenExpired: (token, authType) => {
        try {
            if (!token) {
                throw new Error('Token cannot be empty');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }

        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    verifyToken: (jwtToken, authType) => {
        try {
            if (!jwtToken) {
                throw new Error('JWT token cannot be empty');
            }
            let privateKey = null;
            if (authType === 'access') {
                privateKey = process.env.JWT_ACCESS_TOKEN_SECRET;
            } else if (authType === 'refresh') {
                privateKey = process.env.JWT_REFRESH_TOKEN_SECRET;
            } else {
                throw new Error('Invalid auth type');
            }
            return jwt.verify(jwtToken, privateKey);
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },

    generateToken: (payload, expiresIn, authType) => {
        try {
            if (!payload) {
                throw new Error('Payload cannot be empty');
            }
            if (!expiresIn) {
                throw new Error('ExpiresIn cannot be empty');
            }
            if (expiresIn <= 0) {
                throw new Error('ExpiresIn must be greater than 0');
            }
            if (!authType) {
                throw new Error('Auth type cannot be empty');
            }

            let privateKey = null;

            if (authType === 'access') {
                privateKey = process.env.JWT_ACCESS_TOKEN_SECRET;
            } else if (authType === 'refresh') {
                privateKey = process.env.JWT_REFRESH_TOKEN_SECRET;
            } else {
                throw new Error('Invalid auth type');
            }
            return jwt.sign(payload, privateKey, {
                expiresIn: expiresIn,
            });
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
};

module.exports = JWTUtil;
