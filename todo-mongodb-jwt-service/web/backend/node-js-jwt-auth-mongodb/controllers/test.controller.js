const { printErrorDetails, log } = require('../utils/debug.util');
const http = require('../helpers/http.helper');
const { OK } = require('../helpers/constants.helper');

class TestController {
    allAccess(req, res) {
        return http.successResponse(res, OK, 'Public Content.');
    }

    userBoard(req, res) {
        return http.successResponse(res, OK, 'User Content.');
    }

    adminBoard(req, res) {
        return http.successResponse(res, OK, 'Admin Content.');
    }

    moderatorBoard(req, res) {
        return http.successResponse(res, OK, 'Moderator Content.');
    }
}

module.exports = TestController;
