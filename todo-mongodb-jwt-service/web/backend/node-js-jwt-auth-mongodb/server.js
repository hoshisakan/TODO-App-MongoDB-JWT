const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `.env.${env.trim()}`);

console.log(`envPath: ${envPath}`);

dotenv.config({ path: envPath });

console.log(`env.trim(): ${env.trim()}`);

console.log(`Logfile path: ${process.env.LOG_FILE_PATH}`);

const logger = require('./extensions/logger.extension');

const app = express();

const corsOptions = require('./config/corsOptions').corsOptions;

const DatabackupExtension = require('./extensions/databackup.extension');

// const DebugHelper = require('./utils/debug.util');

require('./models/db_init');

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('./routes/index.route');

const apiRouter = require('./routes/index.route');

app.use('/api', apiRouter, (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    console.log('api route hit');
    next();
});

DatabackupExtension.start();

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
