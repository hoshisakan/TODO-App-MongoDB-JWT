const { printErrorDetails, log } = require('../utils/debug.util');
const http = require('../helpers/http.helper');
const {
    OK,
    BAD_REQUEST,
} = require('../helpers/constants.helper');

const UserService = require('../services/user.service');


class UserController {
    constructor() {
        this.userService = new UserService();
    }

    findAll = async (req, res) => {
        try {
            const result = await this.userService.find(req.query);
            return http.successResponse(res, OK, result);
        } catch (error) {
            printErrorDetails(error, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = UserController;
