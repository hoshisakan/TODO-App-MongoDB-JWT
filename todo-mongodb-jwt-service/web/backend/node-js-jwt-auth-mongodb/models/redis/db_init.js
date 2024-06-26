const redis = require('redis');
const config = require('../../config/cache.config.js');

const { logError, logInfo } = require('../../utils/log.util.js');
const { filenameFilter } = require('../../utils/regex.util.js');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const connectionString = `redis://:${config.PASSWORD}@${config.HOST}:${config.PORT}`;

const createConnection = () => {
    try {
        logInfo(`Connecting to the cache...`, fileDetails, true);

        // logInfo(`connectionString: ${connectionString}`, fileDetails, true);

        const client = redis.createClient({
            url: connectionString,
            enable_offline_queue: true,
        });

        client.connect();

        logInfo(`Successfully connected to the cache redis server`, fileDetails, true);

        return client;
    } catch (error) {
        logError(error, fileDetails, true);
        process.exit();
    }
};

module.exports = createConnection();