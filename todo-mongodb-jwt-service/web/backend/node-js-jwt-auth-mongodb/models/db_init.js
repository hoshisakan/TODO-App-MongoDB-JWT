const db = require('./index.js');
const config = require('../config/db.config');
const Role = db.role;

const DebugHelper = require('../utils/error.util');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

const createConnection = db.mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const initial = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        DebugHelper.log(result, true);
        if (result === 0) {
            await Promise.all([
                new Role({ name: 'user' }).save(),
                new Role({ name: 'moderator' }).save(),
                new Role({ name: 'admin' }).save(),
            ]);
            DebugHelper.log('Roles created successfully!', true);
        } else {
            DebugHelper.log('Roles already exist.', true);
        }
    } catch (error) {
        DebugHelper.printErrorDetails(error);
    }
};

createConnection
    .then((conn) => {
        DebugHelper.log(conn);
        initial();
        conn.connection.db.listCollections().toArray((err, names) => {
            if (err) {
                DebugHelper.printErrorDetails(err);
            } else {
                if (!names) {
                    console.log('No collections found.');
                } else {
                    names.forEach((name) => {
                        console.log(`Collection name: ${name.name}`);
                    });
                }
            }
        });
    })
    .catch((err) => {
        console.error('Connection error', err);
        logger.error('Connection error', err);

        process.exit();
    });
