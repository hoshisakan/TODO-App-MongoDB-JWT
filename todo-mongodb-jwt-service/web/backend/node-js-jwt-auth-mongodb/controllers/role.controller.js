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

const RoleService = require('../services/role.service');


class RoleController {
    constructor() {
        this.roleService = new RoleService();
    }

    findAll = async (req, res) => {
        try {
            const param = req.query;
            const result = await this.roleService.find(param);
            return http.successResponse(res, OK, result);
        } catch (error) {
            printErrorDetails(error, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = RoleController;
