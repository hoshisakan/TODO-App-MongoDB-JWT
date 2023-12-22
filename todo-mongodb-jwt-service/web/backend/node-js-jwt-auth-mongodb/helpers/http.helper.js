const { logError } = require('../utils/log.util');

const HttpHelper = {
    response: (data, status, message) => {
        return {
            data,
            status,
            message,
        };
    },

    successResponse: (res, status, message, data) => {
        try {
            return res.status(status).json(HttpHelper.response(data, status, message));
        } catch (error) {
            logError(error, true);
        }
    },

    errorResponse: (res, status, message, error) => {
        try {
            return res.status(status).json(HttpHelper.response(error, status, message));
        } catch (error) {
            logError(error, true);
        }
    },
};

module.exports = HttpHelper;
