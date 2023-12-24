class Repository {
    constructor(model) {
        this.model = model;
    }

    async find(expression={}) {
        try {
            return await this.model.find(expression);
        } catch (err) {
            throw err;
        }
    }

    async findOne(expression={}) {
        return this.model.findOne(expression);
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

    async updateOne(expression, entity) {
        return await this.model.updateOne(expression, entity);
    }

    async updateMany(expression, entity) {
        return await this.model.updateMany(expression, entity);
    }

    async deleteOne(expression) {
        return await this.model.deleteOne(expression);
    }

    async deleteMany(expression) {
        return await this.model.deleteMany(expression);
    }
}

module.exports = Repository;
