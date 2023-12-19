const db = require('./index.js');
const config = require('../config/db.config');
const Role = db.role;

const { printErrorDetails, log } = require('../utils/debug.util');
const { stringify } = require('../utils/json.util');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

const createConnection = db.mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const initial = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        log(`Role count: ${stringify(result)}`, true);
        if (result === 0) {
            await Promise.all([
                new Role({ name: 'user' }).save(),
                new Role({ name: 'moderator' }).save(),
                new Role({ name: 'admin' }).save(),
            ]);
            log('Roles created successfully!', true);
        } else {
            log('Roles already exist.', true);
        }
        return;
    } catch (error) {
        printErrorDetails(error);
    }
};

createConnection
    .then((conn) => {
        log(`Successfully connected to the database: ${config.DATABASE}`, true);
        initial();
        ///TODO: Get all collections (tables) from database, but not working
        // conn.connection.db.listCollections().toArray((err, items) => {
        //     log(`Collections: ${stringify(items)}`, true);
        // });
    })
    .catch((err) => {
        printErrorDetails(err, true);
        process.exit();
    });
