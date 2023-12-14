const HttpHelper = {
    response: (data, status, message) => {
        return {
            data,
            status,
            message,
        };
    },

    successResponse: (res, status, message, data) => {
        return res.status(status).json(HttpHelper.response(data, status, message));
    },

    errorResponse: (res, status, message, error) => {
        return res.status(status).json(HttpHelper.response(error, status, message));
    },
};

module.exports = HttpHelper;

