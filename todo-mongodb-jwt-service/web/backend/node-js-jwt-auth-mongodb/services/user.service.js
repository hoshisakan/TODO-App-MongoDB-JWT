// const UserRepository = require('../repositories/user.repository');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');


class UserService extends BaseService {
    constructor() {
        const unitOfWork = new UnitOfWork();
        super(unitOfWork.users);
        this.unitOfWork = unitOfWork;
    }
}

module.exports = UserService;