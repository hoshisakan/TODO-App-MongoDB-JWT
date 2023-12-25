const redis_cache = require('../models/redis/db_init');
const { logError, logInfo } = require('../utils/log.util.js');
const { filenameFilter } = require('../utils/regex.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const CacheRedisUtil = {
    set: async (key, value) => {
        try {
            logInfo(`key: ${key}`, fileDetails, true);
            logInfo(`value: ${value}`, fileDetails, true);

            const result = await redis_cache.set(key, value);
            logInfo(`set result: ${result}`, fileDetails, true);

            if (result !== 'OK') {
                throw new Error('Failed to set the value in the cache.');
            }

            const validateResult = await redis_cache.get(key);
            logInfo(`validateResult: ${validateResult}`, fileDetails, true);

            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
    setex: async (key, value, expiry) => {
        try {
            logInfo(`key: ${key}`, fileDetails, true);
            logInfo(`value: ${JSON.stringify(value)}`, fileDetails, true);
            logInfo(`expiry: ${expiry}`, fileDetails, true);

            const result = await redis_cache.setEx(key, expiry, value);
            logInfo(`setex result: ${JSON.stringify(result)}`, fileDetails, true);

            if (result !== 'OK') {
                throw new Error('Failed to set the value in the cache.');
            }

            const validateResult = await redis_cache.get(key);

            logInfo(`validateResult: ${JSON.stringify(validateResult)}`, fileDetails, true);

            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    },
    mget: async (keys=[]) => {
        try {
            if (!Array.isArray(keys) || keys.length === 0) {
                throw new Error('Keys must be an array.');
            }
            logInfo(`keys: ${keys}`, fileDetails, true);
            const result = await redis_cache.mGet(keys);
            logInfo(`result: ${result}`, fileDetails, true);
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    },
    get: async (key) => {
        try {
            logInfo(`key: ${key}`, fileDetails, true);

            const result = await redis_cache.get(key);
            logInfo(`result: ${result}`, fileDetails, true);
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
    del: async (key) => {
        try {
            logInfo(`key: ${key}`, fileDetails, true);

            const result = await redis_cache.del(key);
            logInfo(`result: ${result}`, fileDetails, true);
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
    keys: async (pattern) => {
        try {
            logInfo(`pattern: ${pattern}`, fileDetails, true);

            const result = await redis_cache.keys(pattern);
            logInfo(`result: ${result}`, fileDetails, true);
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
    flushall: async () => {
        try {
            const result = await redis_cache.flushAll();
            logInfo(`result: ${result}`, fileDetails, true);
            return result;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
    exists: async (key) => {
        try {
            logInfo(`key: ${key}`, fileDetails, true);
            const result = await redis_cache.exists(key);
            logInfo(`result: ${result}`, fileDetails, true);
            return result === 1;
        } catch (error) {
            logError(error, fileDetails, true);
            return null;
        }
    },
};

module.exports = CacheRedisUtil;
