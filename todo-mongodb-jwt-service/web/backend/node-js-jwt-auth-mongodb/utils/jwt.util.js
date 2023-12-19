const logger = require('../extensions/logger.extension');
const { stringify } = require('./json.util');
const config = require('../config/auth.config.js');
const jwt = require('jsonwebtoken');

const jwtSecret = config.jwtSecret;

const JWTUtil = {
    jwtVertify: (jwtToken) => {
        if (!jwtToken) {
            throw new Error('JWT token cannot be empty');
        }

        if (!jwtSecret) {
            throw new Error('JWT secret cannot be empty');
        }

        return jwt.verify(jwtToken, jwtSecret);
    },
    jwtSign : (payload, expiresIn) => {
        if (!payload) {
            throw new Error('Payload cannot be empty');
        }

        if (!expiresIn) {
            throw new Error('ExpiresIn cannot be empty');
        }

        if (expiresIn <= 0) {
            throw new Error('ExpiresIn must be greater than 0');
        }

        if (!jwtSecret) {
            throw new Error('JWT secret cannot be empty');
        }

        return jwt.sign(payload, jwtSecret, {
            expiresIn: expiresIn
        });
    }
};

module.exports = JWTUtil;