const db = require('./index.js');
const config = require('../../config/db.config.js');
const Role = db.role;

const { logError, logInfo } = require('../../utils/log.util.js');
// const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../../utils/regex.util.js');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const createConnection = async () => {
    try {
        const conn = await db.mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logInfo(`Successfully connected to the mongodb database.`, fileDetails, true);
        await initial();
        return conn;
    } catch (error) {
        logError(error, fileDetails, true);
        process.exit();
    }
};

const initial = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        logInfo(`result: ${result}`, fileDetails, true);
        if (result === 0) {
            await Promise.all([
                new Role({ name: 'user' }).save(),
                new Role({ name: 'moderator' }).save(),
                new Role({ name: 'admin' }).save(),
            ]);
        } else {
            logInfo(`Roles already exists.`, fileDetails, true);
        }
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

createConnection();
