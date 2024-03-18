class Repository {
    constructor(model) {
        this.model = model;
    }

    async find(expression = {}, fields = {}, sortFields = {}) {
        return await this.model.find(expression).select(fields).sort(sortFields);
    }

    async findOne(expression = {}) {
        return this.model.findOne(expression);
    }

    async findById(id, fields = {}) {
        return await this.model.findById(id).select(fields);
    }

    async create(entity) {
        return await this.model.create(entity);
    }

    async insertMany(entities) {
        return await this.model.insertMany(entities);
    }

    ///TODO: option add new attribute for return modified document instead of original
    async findByIdAndUpdate(id, entity) {
        return await this.model.findByIdAndUpdate(id, entity, { new: true });
    }

    async findOneAndReplace(expression, entity) {
        ///TODO: The method doesn't exists runValidators option, so it can't be to validate model schema rules
        return await this.model.findOneAndReplace(expression, entity, { new: true });
    }

    ///TODO: option add new attribute for return modified document instead of original
    async findOneAndUpdate(expression, entity) {
        ///TODO: runValidators set true will be to enable model schema set rules validator
        return await this.model.findOneAndUpdate(expression, { $set: entity }, { runValidators: true, new: true });
    }

    async updateOne(expression, entity) {
        return await this.model.updateOne(expression, { $set: entity });
    }

    async updateMany(expression, entity) {
        return await this.model.updateMany(expression, { $set: entity });
    }

    async deleteOne(expression) {
        return await this.model.deleteOne(expression);
    }

    async deleteMany(expression) {
        return await this.model.deleteMany(expression);
    }

    async countDocuments() {
        return await this.model.countDocuments();
    }
}

module.exports = Repository;
