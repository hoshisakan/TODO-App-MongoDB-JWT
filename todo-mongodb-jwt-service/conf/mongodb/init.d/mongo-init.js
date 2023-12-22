const { logInfo, logError } = require('../utils/log.util.js');

const { filenameFilter } = require('./utils/regex.util');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

logInfo('Start init script.', fileDetails, true);

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

logInfo('End init script.', fileDetails, true);
