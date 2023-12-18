const { printErrorDetails, log } = require('../utils/debug.util');
const http = require('../helpers/http.helper');
const {
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NO_CONTENT,
    BAD_REQUEST,
    CREATED,
} = require('../helpers/constants.helper');

const UserService = require('../services/user.service');


class UserController {
    constructor() {
        this.userService = new UserService();
    }

    findAll = async (req, res) => {
        try {
            const param = req.query;
            const result = await this.userService.find(param);
            return http.successResponse(res, OK, result);
        } catch (error) {
            printErrorDetails(error, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = UserController;
