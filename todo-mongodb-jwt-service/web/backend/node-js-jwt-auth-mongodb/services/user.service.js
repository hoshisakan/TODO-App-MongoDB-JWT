// const UserRepository = require('../repositories/user.repository');
const { log } = require('../utils/debug.util');
const { stringify } = require('../utils/json.util');
const { endpoint } = require('../utils/validate.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');
const unitOfWork = new UnitOfWork();


class UserService extends BaseService {
    constructor() {
        super(unitOfWork.users);
        this.unitOfWork = unitOfWork;
    }

    ///TODO: Search roles by name
    searchRolesByName = async (roles) => {
        return await this.unitOfWork.roles.find({ name: { $in: roles } });
    };

    ///TODO: Get condition of multiple fields by query params and check fields
    handleMultQueryParams = async (queryParams) => {
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

    ///TODO: Get condition of one fields by query params and check field
    handleSingleQueryParams = async (queryParams, checkField) => {
        let condtion = {};

        ///TODO: If not add $or operator, then will be use 'AND' operator search in database
        if (queryParams.username && checkField === 'username') {
            condtion.username = queryParams.username;
        } else if (queryParams.email && checkField === 'email') {
            condtion.email = queryParams.email;
        } else if (queryParams.roles && checkField === 'roles') {
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

    ///TODO: Check query params is valid, allMatch is true then must all fields match with validateFields fields, otherwise return false
    checkQueryParams = (queryParams, allMatch) => {
        let checkFields = Object.keys(queryParams);
        const checkFieldsCount = checkFields.length;
        log(`checkFields: ${checkFieldsCount}`, true);
        const validateFields = endpoint.userEndpoint.validateFields;
        log(`validateFields: ${stringify(validateFields)}`, true);
        let result = false;

        if (checkFieldsCount == 1) {
            result = validateFields.includes(checkFields[0]) ? true : false;
        } else if (checkFieldsCount > 1 && allMatch) {
            ///TODO: Check query params is valid, every method equal to C# LINQ All method
            ///TODO: must all fields match with validateFields fields, otherwise return false
            result = validateFields.every((field) => checkFields.includes(field)) ? true : false;
        } else if (checkFieldsCount > 1 && !allMatch) {
            result = validateFields.some((field) => checkFields.includes(field)) ? true : false;
        }
        return result;
    };

    ///TODO: Find one user by query params and check field
    findOne = async (queryParams, checkField) => {
        if (this.checkQueryParams(queryParams) && checkField) {
            let condtion = {};
            condtion = await this.handleSingleQueryParams(queryParams, checkField);
            log(`condtion: ${stringify(condtion)}, checkField: ${checkField}`, true);
            return await this.unitOfWork.users.findOne(condtion);
        } else {
            throw new Error('Query params is not valid or checkField is not valid');
        }
    };

    ///TODO: Find all users by query params
    find = async (queryParams) => {
        if (queryParams) {
            if (this.checkQueryParams(queryParams)) {
                log(`queryParams: ${stringify(queryParams)}`, true);
                let condtion = {};

                condtion = await this.handleMultQueryParams(queryParams);

                log(`condtion: ${stringify(condtion)}`, true);

                // return [];
                return await this.unitOfWork.users.find(condtion);
            } else {
                log(`Not pass query parameters check`, true);
                return [];
            }
        }
        return await this.unitOfWork.users.find();
    };
}

module.exports = UserService;
