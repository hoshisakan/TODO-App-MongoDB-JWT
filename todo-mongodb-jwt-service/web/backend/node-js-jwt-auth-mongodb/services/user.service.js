// const UserRepository = require('../repositories/user.repository');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const { log } = require('../utils/debug.util');
const { stringify } = require('../utils/json.util');
const { endpoint } = require('../utils/validate.util');

const unitOfWork = new UnitOfWork();


class UserService extends BaseService {
    constructor() {
        super(unitOfWork.users);
        this.unitOfWork = unitOfWork;
    }

    searchRolesByName = async (roles) => {
        return await this.unitOfWork.roles.find({ name: { $in: roles } });
    };

    handleQueryParams = async (queryParams) => {
        let condtion = {};

        ///TODO: If fields different quantity, then will be use 'OR' operator search in database
        if (queryParams.username && queryParams.email && queryParams.roles) {
            const roles = await this.searchRolesByName(queryParams.roles.split(','));

            if (!roles) {
                throw new Error('Roles cannot be found');
            }

            log(`roles: ${stringify(roles)}`, true);

            condtion = {
                $or: [
                    {
                        username: {
                            $in: queryParams.username.split(','),
                        },
                    },
                    {
                        email: {
                            $in: queryParams.email.split(','),
                        },
                    },
                    {
                        roles: {
                            $in: roles,
                        },
                    },
                ],
            };
        }

        ///TODO: If not add $or operator, then will be use 'AND' operator search in database
        if (queryParams.username) {
            condtion.username = {
                $in: queryParams.username.split(','),
            };
        }

        if (queryParams.email) {
            condtion.email = {
                $in: queryParams.email.split(','),
            };
        }

        if (queryParams.roles) {
            const roles = await this.searchRolesByName(queryParams.roles.split(','));

            if (!roles) {
                throw new Error('Roles cannot be found');
            }

            log(`roles: ${stringify(roles)}`, true);

            condtion.roles = {
                $in: roles,
            };
        }
        return condtion;
    };

    checkQueryParams = (queryParams) => {
        const fields = Object.keys(queryParams);
        const validateFields = endpoint.userEndpoint.validateFields;

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

            return await this.unitOfWork.users.find(condtion);
        }
        return await this.unitOfWork.users.find();
    };
}

module.exports = UserService;
