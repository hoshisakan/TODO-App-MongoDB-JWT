const Repository = require('./repository');


class RoleRepository extends Repository {
    constructor(model) {
        super(model);
    }
}

module.exports = RoleRepository;