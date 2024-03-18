const Repository = require('./repository');

class TraceErrorRepository extends Repository {
    constructor(model) {
        super(model);
    }

    async find(expression = {}, fields = {}, errorFKFields = { name: 1 }, sortFields = { createdAt: -1 }) {
        return await this.model
            .find(expression)
            .populate('errorCategory', errorFKFields)
            .select(fields)
            .sort(sortFields);
    }

    async findOne(expression = {}, fields = {}, errorFKFields = { name: 1 }) {
        return await this.model.findOne(expression).populate('errorCategory', errorFKFields).select(fields);
    }

    async findById(id, fields = {}, errorFKFields = { name: 1 }) {
        return await this.model.findById(id).populate('errorCategory', errorFKFields).select(fields);
    }
}

module.exports = TraceErrorRepository;
