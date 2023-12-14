const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `.env.${env.trim()}`);

console.log(`envPath: ${envPath}`);

dotenv.config({ path: envPath });

console.log(`env.trim(): ${env.trim()}`);

const config = require('./config/config');

console.log(`Logfile path: ${process.env.LOG_FILE_PATH}`);

const logger = require('./extensions/logger.extension');

const app = express();

const corsOptions = require('./config/corsOptions').corsOptions;

const DatabackupExtension = require('./extensions/databackup.extension');

const db = require('./models');
const Role = db.role;

// console.log(`config.HOST: ${config.HOST}`);
// console.log(`config.PORT: ${config.PORT}`);
// console.log(`config.DATABASE: ${config.DATABASE}`);
// console.log(`config.USERNAME: ${config.USERNAME}`);
// console.log(`config.PASSWORD: ${config.PASSWORD}`);

const DebugHelper = require('./utils/error.utils');
const e = require('express');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

// console.log(`connectionString: ${connectionString}`);

const createConnection = db.mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

createConnection
    .then((conn) => {
        console.log('Connection to MongoDB successful.');
        logger.info('Connection to MongoDB successful.');
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

const initial = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        console.log(`result: ${result}`);
        if (result === 0) {
            await Promise.all([
                new Role({ name: 'user' }).save(),
                new Role({ name: 'moderator' }).save(),
                new Role({ name: 'admin' }).save(),
            ]);
            console.log('Added roles to database.');
        } else {
            console.log('Roles already exist in database.');
        }
    } catch (error) {
        console.log(error);
    }
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

const databackupExtension = new DatabackupExtension();

databackupExtension.start();

// simple route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to bezkoder application.' });
});

// set port, listen for requests
const PORT = process.env.SERVER_PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    logger.info(`Server is running on port ${PORT}.`);
});
