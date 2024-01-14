const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const { OK, BAD_REQUEST } = require('../../helpers/constants.helper');

const TodoCategoryService = require('../../services/v1/todo.category.service');

class TodoCategoryController {
    constructor() {
        this.todoCategoryService = new TodoCategoryService();
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
            const result = await this.todoCategoryService.bulkCreate(req.body);
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
    //         const result = await this.todoCategoryService.bulkUpdate(req.body);
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
            const result = await this.todoCategoryService.create(req.body);
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
            const result = await this.todoCategoryService.updateById(req.params.id, req.body);
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
            const result = await this.todoCategoryService.patchUpdateById(req.params.id, req.body);
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
            const result = await this.todoCategoryService.deleteById(req.params.id);
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
            const result = await this.todoCategoryService.findById(req.params.id);
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
            const result = await this.todoCategoryService.deleteAll();
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    }

    findAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.todoCategoryService.findAll(req.query);
            return http.successResponse(res, OK, result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = TodoCategoryController;
