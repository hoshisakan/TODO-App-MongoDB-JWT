// const RoleRepository = require('../repositories/role.repository');
const BaseService = require('./base.service');
const UnitOfWork = require('../repositories/unitwork');


class RoleService extends BaseService {
    constructor() {
        const unitOfWork = new UnitOfWork();
        super(unitOfWork.roles);
        this.unitOfWork = unitOfWork;
    }
}

module.exports = RoleService;