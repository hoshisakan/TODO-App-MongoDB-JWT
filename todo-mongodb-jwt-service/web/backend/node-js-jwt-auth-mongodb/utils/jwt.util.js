const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/log.util.js');
const { filenameFilter } = require('../utils/regex.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const fileDetails = `[${filenameWithoutPath}]`;


const JWTUtil = {
    verifyToken: (jwtToken, authType) => {
        if (!jwtToken) {
            throw new Error('JWT token cannot be empty');
        }
        if (!authType) {
            throw new Error('Auth type cannot be empty');
        }
        try {
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
