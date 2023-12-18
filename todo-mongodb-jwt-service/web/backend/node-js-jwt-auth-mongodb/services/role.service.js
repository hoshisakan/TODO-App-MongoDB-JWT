// const RoleRepository = require('../repositories/role.repository');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const { log } = require('../utils/debug.util');
const { stringify } = require('../utils/json.util');
const { endpoint } = require('../utils/validate.util');

const unitOfWork = new UnitOfWork();


class RoleService extends BaseService {
    constructor() {
        super(unitOfWork.roles);
        this.unitOfWork = unitOfWork;
    }

    handleQueryParams = async (queryParams) => {
        let condtion = {};

        ///TODO: If fields different quantity, then will be use 'OR' operator search in database
        if (queryParams.id && queryParams.name) {
            log(`Test`, true);
            condtion = {
                $or: [
                    {
                        _id: {
                            $in: queryParams.id.split(','),
                        },
                    },
                    {
                        name: {
                            $in: queryParams.name.split(','),
                        },
                    },
                ],
            };
        }

        ///TODO: If not add $or operator, then will be use 'AND' operator search in database
        if (queryParams.id) {
            condtion._id = {
                $in: queryParams.id.split(','),
            };
        }

        if (queryParams.name) {
            condtion.name = {
                $in: queryParams.name.split(','),
            };
        }
        return condtion;
    };

    checkQueryParams = (queryParams) => {
        const fields = Object.keys(queryParams);
        const validateFields = endpoint.roleEndpoint.validateFields;

        if (fields.length > 0) {
            log(`validateFields: ${stringify(validateFields)}`, true);
            ///TODO: Check query params is valid, every method equal all syntax,
            ///TODO: must all fields match with validateFields fields, otherwise return false
            const result = fields.every((field) => validateFields.includes(field));

            if (!result) {
                throw new Error('Query params is not valid');
            }
            return true;
        }
        return false;
    };

    find = async (queryParams) => {
        if (this.checkQueryParams(queryParams)) {
            log(`queryParams: ${stringify(queryParams)}`, true);
            let condtion = {};

            condtion = await this.handleQueryParams(queryParams);

            log(`condtion: ${stringify(condtion)}`, true);

            return await this.unitOfWork.roles.find(condtion);
        }
        return await this.unitOfWork.roles.find();
    };
}

module.exports = RoleService;
