const { logInfo, logError } = require('../utils/log.util');
const { stringify } = require('../utils/json.util');
const { endpoint, queryOperator } = require('../utils/validate.util');
const { filenameFilter } = require('../utils/regex.util');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();
const findValidateFields = endpoint.roleEndpoint.findValidateFields;
const validateMode = endpoint.roleEndpoint.validateMode;
const validateOperators = queryOperator.validateOperators;
const mongoOperators = queryOperator.mongoOperators;

class RoleService extends BaseService {
    constructor() {
        super(unitOfWork.roles);
        this.unitOfWork = unitOfWork;
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

    findOne = async (expression = {}) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = null;

        result = await this.unitOfWork.roles.findOne(expression);
        return result;
    };

    ///TODO: Find all roles by query params
    find = async (expression = {}) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = [];

        result = await this.unitOfWork.roles.find(expression);
        return result;
    };
}

module.exports = RoleService;
