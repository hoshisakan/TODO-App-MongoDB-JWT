const MongooseFilterUtil = {
    toObjectId: (id) => {
        var ObjectId = require('mongoose').Types.ObjectId;
        return new ObjectId(id.toString());
    },
};

module.exports = MongooseFilterUtil;
