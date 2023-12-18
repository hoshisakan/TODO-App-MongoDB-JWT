class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    find = async (condition={}) => {
        return await this.repository.find(condition);
    };

    findOne = async (condition={}) => {
        return await this.repository.findOne(condition);
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

    updateOne = async (condition, entity) => {
        return await this.repository.updateOne(condition, entity);
    };

    updateMany = async (condition, entity) => {
        return await this.repository.updateMany(condition, entity);
    }

    deleteOne = async (condition) => {
        return await this.repository.deleteOne(condition);
    };

    deleteMany = async (condition) => {
        return await this.repository.deleteMany(condition);
    };
}

module.exports = BaseService;
