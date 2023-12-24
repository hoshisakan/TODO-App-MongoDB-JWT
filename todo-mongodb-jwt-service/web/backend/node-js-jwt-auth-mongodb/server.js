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

const app = express();

const corsOptions = require('./config/corsOptions').corsOptions;

const DatabackupExtension = require('./extensions/databackup.extension');

const { logInfo } = require('./utils/log.util');

const { filenameFilter } = require('./utils/regex.util');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

require('./models/mongodb/db_init');

const client = require('./models/redis/db_init');

const key = 'string key4';
client.set(key, 'string val', client.print);
const result = client.get(key, client.print);

logInfo(`result: ${result}`, fileDetails, true);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('./routes/index.route');

const apiRouter = require('./routes/index.route');

app.use('/api', apiRouter, (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    logInfo(`Request URL: ${req.originalUrl}`, fileDetails, true);
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
    logInfo(`Server is running on port ${PORT}.`, fileDetails, true);
});
