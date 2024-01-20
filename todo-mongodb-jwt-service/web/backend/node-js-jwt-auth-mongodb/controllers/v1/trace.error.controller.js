const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const { OK, BAD_REQUEST } = require('../../helpers/constants.helper');

const traceErrorService = require('../../services/v1/trace.error.service');

class ErrorCategoryController {
    constructor() {
        this.traceErrorService = new traceErrorService();
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

    bulkCreate = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.bulkCreate(req.body);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    // bulkUpdate = async (req, res) => {
    //     const classNameAndFuncName = this.getFunctionCallerName();
    //     const fileDetails = this.getFileDetails(classNameAndFuncName);
    //     try {
    //         const result = await this.traceErrorService.bulkUpdate(req.body);
    //         return http.successResponse(res, OK, result);
    //     } catch (error) {
    //         logError(error, fileDetails, true);
    //         return http.errorResponse(res, BAD_REQUEST, error.message);
    //     }
    // };

    create = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.create(req.body);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    updateById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.updateById(req.params.id, req.body);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    patchUpdateById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.patchUpdateById(req.params.id, req.body);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    deleteById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.deleteById(req.params.id);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    findById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.findById(req.params.id);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    deleteAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.deleteAll();
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    }

    // findOne = async (req, res) => {
    //     const classNameAndFuncName = this.getFunctionCallerName();
    //     const fileDetails = this.getFileDetails(classNameAndFuncName);
    //     try {
    //         const result = await this.traceErrorService.findOne(req.query);
    //         return http.successResponse(res, OK, result);
    //     } catch (error) {
    //         logError(error, fileDetails, true);
    //         return http.errorResponse(res, BAD_REQUEST, error.message);
    //     }
    // };

    findAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.traceErrorService.findAll(req.query);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = ErrorCategoryController;
