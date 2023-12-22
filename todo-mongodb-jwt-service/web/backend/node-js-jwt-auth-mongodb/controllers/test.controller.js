const { logError, logInfo } = require('../utils/log.util');
const http = require('../helpers/http.helper');
const { filenameFilter } = require('../utils/regex.util');
const { OK } = require('../helpers/constants.helper');

class TestController {
    constructor() {
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
