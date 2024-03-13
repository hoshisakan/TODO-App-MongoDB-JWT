const MongooseFilterUtil = {
    getSelectFields: (validateModel) => {
        switch (validateModel) {
            case 'Todo':
                return {
                    // _id: 1,
                    // createdAt: 0,
                };
            case 'TodoCategory':
                return {
                    _id: 1,
                    name: 1,
                    value: 1,
                };
            case 'TraceError':
                return {
                    // _id: 1,
                    // createdAt: 0,
                };
            case 'ErrorCategory':
                return {
                    _id: 0,
                    name: 1,
                    value: 1,
                };
            case 'User':
                return {
                    _id: 1,
                    username: 1,
                    email: 1,
                    roles: 1,
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
                        _id: 1,
                        name: 1,
                        value: 1,
                        // createdAt: 0,
                        // updatedAt: 0,
                        // __v: 0,
                    },
                };
            case 'TraceError':
                return {
                    errorCategory: {
                        _id: 1,
                        message: 1,
                        stack: 1,
                        description: 1,
                        line: 1,
                        errorCategoryName: 1,
                    },
                };
            case 'User':
                return {
                    // role: { _id: 1, name: 1 },
                    // role: { _id: 1, level: 1 },
                    // role: { _id: 1, name: 1, level: 1 },
                    // role: { name: 1, level: 1 },
                    role: { _id: 0, name: 1, level: 1 },
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
