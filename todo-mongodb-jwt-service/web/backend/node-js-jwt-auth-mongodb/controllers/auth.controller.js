// const config = require('../config/auth.config');
// const db = require('../models');
const DebugHelper = require('../utils/error.util');
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
            const user = await this.authService.signup(req.body);
            return http.successResponse(res, CREATED, user);
        } catch (error) {
            DebugHelper.printErrorDetails(error);
            return http.errorResponse(res, INTERNAL_SERVER_ERROR, error.message);
        }
    }

    signin = async (req, res) => {
        try {
            const user = await this.authService.signin(req.body);
            return http.successResponse(res, OK, user);
        } catch (error) {
            DebugHelper.printErrorDetails(error, true);
            return http.errorResponse(res, INTERNAL_SERVER_ERROR, error.message);
        }
    }
}

module.exports = AuthController;
