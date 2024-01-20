const Repository = require('./repository');

class TraceErrorRepository extends Repository {
    constructor(model) {
        super(model);
    }

    async find(expression = {}) {
        return await this.model.find(expression).populate('errorCategory', 'name');
    }

    async findOne(expression = {}) {
        return await this.model.findOne(expression).populate('errorCategory', 'name');
    }

    async findById(id) {
        return await this.model.findById(id).populate('errorCategory', 'name');
    }
}

module.exports = TraceErrorRepository;
