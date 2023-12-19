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
}

module.exports = RoleService;
