const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const { OK, BAD_REQUEST } = require('../../helpers/constants.helper');

const UserService = require('../../services/v1/user.service');

class UserController {
    constructor() {
        this.userService = new UserService();
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    findAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.userService.find(req.query);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = UserController;