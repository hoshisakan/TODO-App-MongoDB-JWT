class Repository {
    constructor(model) {
        this.model = model;
    }

    async find(expression = {}) {
        return await this.model.find(expression);
    }

    async findOne(expression = {}) {
        return this.model.findOne(expression);
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async create(entity) {
        return await this.model.create(entity);
    }

    async createMany(entities) {
        return await this.model.insertMany(entities);
    }

    ///TODO: option add new attribute for return modified document instead of original
    async update(id, entity) {
        return await this.model.findByIdAndUpdate(id, entity, { new: true });
    }

    ///TODO: option add new attribute for return modified document instead of original
    async findOneAndUpdate(expression, update) {
        return await this.model.findOneAndUpdate(expression, update, { new: true });
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
}

module.exports = Repository;
