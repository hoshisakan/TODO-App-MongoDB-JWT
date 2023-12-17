class Repository {
    constructor(model) {
        this.model = model;
    }

    async find(condition) {
        return this.model.find(condition);
    }

    async findOne(condition) {
        return this.model.findOne(condition);
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async create(entity) {
        return await this.model.create(entity);
    }
    
    ///TODO: option add new attribute for return modified document instead of original
    async update(id, entity) {
        return await this.model.findByIdAndUpdate(id, entity, { new: true });
    }

    async updateOne(condition, entity) {
        return await this.model.updateOne(condition, entity);
    }

    async updateMany(condition, entity) {
        return await this.model.updateMany(condition, entity);
    }

    async deleteOne(condition) {
        return await this.model.deleteOne(condition);
    }

    async deleteAll(condition) {
        return await this.model.deleteMany(condition);
    }
}

module.exports = Repository;
