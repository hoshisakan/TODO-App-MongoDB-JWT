const db = require('./index.js');
const config = require('../../config/db.config.js');
const Role = db.role;

const { logError, logInfo } = require('../../utils/log.util.js');
const { stringify } = require('../../utils/json.util.js');
const { filenameFilter } = require('../../utils/regex.util.js');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const createConnection = async () => {
    try {
        const conn = await db.mongoose.connect(connectionString, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        logInfo(`Successfully connected to the mongodb database.`, fileDetails, true);
        await initial();
        return conn;
    } catch (error) {
        logError(error, fileDetails, true);
        process.exit();
    }
};

const dropDatabase = async () => {
    try {
        const result = await db.mongoose.connection.db.dropDatabase();
        logInfo(`result: ${result}`, fileDetails, true);
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const dropCollection = async (collectionName) => {
    try {
        const result = await db.mongoose.connection.db.dropCollection(collectionName);
        logInfo(`Drop collection result: ${stringify(dropCollection)}`, fileDetails, true);
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const dropAllCollections = async () => {
    try {
        const collections = await db.mongoose.connection.db.listCollections().toArray();
        logInfo(`Drop all collections result: ${stringify(collections)}`, fileDetails, true);
        await Promise.all(
            collections.map(async (collection) => {
                await dropCollection(collection.name);
            })
        );
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const truncateCollection = async (collectionName) => {
    try {
        const result = await db.mongoose.connection.db.collection(collectionName).deleteMany({});
        logInfo(`Truncate collection result: ${result}`, fileDetails, true);
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const truncateAllCollections = async () => {
    try {
        const collections = await db.mongoose.connection.db.listCollections().toArray();
        logInfo(`Truncate all collections: ${collections}`, fileDetails, true);
        await Promise.all(
            collections.map(async (collection) => {
                await truncateCollection(collection.name);
            })
        );
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const createRoles = async () => {
    try {
        await Promise.all([
            new Role({ name: 'user', level: 1 }).save(),
            new Role({ name: 'moderator', level: 2 }).save(),
            new Role({ name: 'admin', level: 10 }).save(),
        ]);
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

const initial = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        logInfo(`result: ${result}`, fileDetails, true);
        if (result === 0) {
            await createRoles();
        } else {
            logInfo(`Roles already exists.`, fileDetails, true);
            // await dropAllCollections();
            // await createRoles();
            // logInfo(`Roles recreated.`, fileDetails, true);
        }
        return;
    } catch (error) {
        logError(error, fileDetails, true);
        return;
    }
};

createConnection();
