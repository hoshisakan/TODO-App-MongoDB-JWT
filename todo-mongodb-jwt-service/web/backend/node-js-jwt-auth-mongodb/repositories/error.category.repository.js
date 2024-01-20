const Repository = require('./repository');


class ErrorCategoryRepository extends Repository {
    constructor(model) {
        super(model);
    }
}

module.exports = ErrorCategoryRepository;