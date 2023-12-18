class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    find = async (condition={}) => {
        return await this.repository.find(condition);
    };

    getById = async (id) => {
        const result = await this.repository.getById(id);

        if (!result) {
            throw new Error('Not found');
        }
        return result;
    }

    create = async (entity) => {
        const result = await this.repository.create(entity);

        if (!result) {
            throw new Error('Not created');
        }
        return result;
    }

    removeAll = async () => {
        return await this.repository.deleteAll();
    }
}

module.exports = BaseService;
