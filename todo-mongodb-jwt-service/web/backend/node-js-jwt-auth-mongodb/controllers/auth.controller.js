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

const AuthService = require('../services/auth.service');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    signup = async (req, res) => {
        try {
            const result = await this.authService.signup(req.body);
            // return http.successResponse(res, CREATED, result);
            return http.successResponse(res, CREATED, 'User was registered successfully!');
        } catch (error) {
            printErrorDetails(error, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    signin = async (req, res) => {
        try {
            const result = await this.authService.signin(req.body);
            return http.successResponse(res, OK, result);
        } catch (error) {
            printErrorDetails(error, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = AuthController;
