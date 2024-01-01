class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    find = async (expression={}) => {
        return await this.repository.find(expression);
    };

    findOne = async (expression={}) => {
        return await this.repository.findOne(expression);
    };

    findById = async (id) => {
        return await this.repository.findById(id);
    };

    create = async (entity) => {
        return await this.repository.create(entity);
    };

    update = async (id, entity) => {
        return await this.repository.update(id, entity);
    };

    updateOne = async (expression, entity) => {
        return await this.repository.updateOne(expression, entity);
    };

    updateMany = async (expression, entity) => {
        return await this.repository.updateMany(expression, entity);
    }

    deleteOne = async (expression) => {
        return await this.repository.deleteOne(expression);
    };

    deleteMany = async (expression) => {
        return await this.repository.deleteMany(expression);
    };
}

module.exports = BaseService;
