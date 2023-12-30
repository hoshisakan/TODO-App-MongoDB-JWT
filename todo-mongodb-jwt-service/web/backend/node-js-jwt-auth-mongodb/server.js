const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
// const expressSession = require('express-session');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `.env.${env.trim()}`);

console.log(`envPath: ${envPath}`);

dotenv.config({ path: envPath });

console.log(`env.trim(): ${env.trim()}`);

console.log(`Logfile path: ${process.env.LOG_FILE_PATH}`);

const app = express();



// const sess = {
//     secret: process.env.SESSION_SECRET,
//     name: process.env.SESSION_NAME,
//     cookie: {
//         path: '/',
//         secure: true,
//         httpOnly: true,
//         maxAge: 60000,
//     },
//     ///TODO: resave - forces the session to be saved back to the session store, even if the session was never modified during the request
//     resave: true,
//     ///TODO: saveUninitialized - forces a session that is "uninitialized" to be saved to the store
//     saveUninitialized: true,
// };

// if (env.trim() === 'development') {
//     app.set('trust proxy', 1);
//     sess.cookie.secure = false;
// }

// app.use(expressSession(sess));

const corsOptions = require('./config/corsOptions').corsOptions;

const DatabackupExtension = require('./extensions/databackup.extension');

const { logInfo } = require('./utils/log.util');

const { filenameFilter } = require('./utils/regex.util');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

require('./models/mongodb/db_init');

app.use(cors(corsOptions));

///TODO: parse requests of content-type - application/json
app.use(express.json());

///TODO: parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

///TODO: Add cookie parser
app.use(cookieParser());

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

///TODO: set port, listen for requests
const PORT = process.env.SERVER_PORT || 8080;
app.listen(PORT, () => {
    logInfo(`Server is running on port ${PORT}.`, fileDetails, true);
});
