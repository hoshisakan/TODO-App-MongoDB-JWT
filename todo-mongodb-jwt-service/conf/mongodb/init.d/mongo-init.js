const DebugHelper = require("../../../web/backend/node-js-jwt-auth-mongodb/utils/error.util");

DebugHelper.log('Starting init script...', true);

const user = 'hoshiyou';
const password = 'NormalPassword12345';
const dbNames = ['TestDB', 'RealDB'];

db = db.getSiblingDB(dbNames[0]);

db.createUser({
    user: user,
    pwd: password,
    roles: [
        {
            role: 'readWrite',
            db: dbNames[0],
        },
    ],
});

db.getSiblingDB(dbNames[1]);

db.createUser({
    user: user,
    pwd: password,
    roles: [
        {
            role: 'readWrite',
            db: dbNames[1],
        },
    ],
});

DebugHelper.log('Finished init script.', true);