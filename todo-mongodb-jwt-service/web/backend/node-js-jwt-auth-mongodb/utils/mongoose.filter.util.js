const MongooseFilterUtil = {
    getSelectFields: (validateModel) => {
        switch (validateModel) {
            case 'Todo':
                return {
                    // createdAt: 0,
                    __v: 0,
                };
            case 'TodoCategory':
                return {
                    _id: 0,
                    name: 1,
                    value: 1,
                };
            default:
                throw new Error(`Unknown validate model name: ${validateModel}`);
        }
    },
    getSelectFKFields: (validateModel) => {
        switch (validateModel) {
            case 'Todo':
                return {
                    user: {
                        _id: 1,
                        username: 0,
                        email: 0,
                        password: 0,
                        isActivate: 0,
                        roles: 0,
                        createdAt: 0,
                    },
                    category: {
                        _id: 0,
                        name: 1,
                        // value: 0,
                        // createdAt: 0,
                        // updatedAt: 0,
                        // __v: 0,
                    },
                };
            case 'TodoCategory':
                return {
                    _id: 0,
                    name: 1,
                    value: 1,
                };
            default:
                throw new Error(`Unknown validate model name: ${validateModel}`);
        }
    },
    toObjectId: (id) => {
        var ObjectId = require('mongoose').Types.ObjectId;
        return new ObjectId(id.toString());
    },
    validObjectId: (id) => {
        var ObjectId = require('mongoose').Types.ObjectId;
        return ObjectId.isValid(id);
    },
};

module.exports = MongooseFilterUtil;
