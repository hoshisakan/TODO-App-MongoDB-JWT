const Repository = require('./repository');


class UserRepository extends Repository {
    constructor(model) {
        super(model);
    }
}

module.exports = UserRepository;