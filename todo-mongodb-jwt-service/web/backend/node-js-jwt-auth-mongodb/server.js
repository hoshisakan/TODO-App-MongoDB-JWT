const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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

app.use(cors(corsOptions));

///TODO: parse requests of content-type - application/json
app.use(express.json());

///TODO: parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

///TODO: add cookie parser
app.use(cookieParser());

const staticPhotoPath = path.join(__dirname, process.env.UPLOAD_PHOTO_STATIC_PATH);
logInfo(`staticPhotoPath: ${staticPhotoPath}.`, fileDetails, true);

///TODO: Reject tls certificate source check, please avoid use it in production environment.
process.env.NODE_TLS_REJECT_UNAUTHORIZED;

//TODO: For debug
// const fs = require('fs');

// if (fs.existsSync(staticPhotoPath)) {
//     logInfo(`Check path does exists`, fileDetails, true);
// }
// else {
//     logInfo(`Check path doesn't exists`, fileDetails, true);
// }

// app.use('/Photos/:userId', express.static(staticPhotoPath));
app.use('/Photos', express.static(staticPhotoPath));

const apiV1Router = require('./routes/v1/index.route');

app.use('/api/v1', apiV1Router, (req, res, next) => {
    // res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    logInfo(`Request URL: ${req.originalUrl}`, fileDetails, true);
    next();
});

///TODO: analysis multpart/form-data request
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

///TODO: Allow all routes received one file
// app.use('/api/v1', upload.single('photo'), apiV1Router, (req, res, next) => {
//     // res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
//     logInfo(`Request URL: ${req.originalUrl}`, fileDetails, true);
//     next();
// });

///TODO: Allow all routes received mlutiple file (max limt 12 files)
// app.use('/api/v1', upload.array('photo', 12), apiV1Router, (req, res, next) => {
//     // res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
//     logInfo(`Request URL: ${req.originalUrl}`, fileDetails, true);
//     next();
// });

DatabackupExtension.start();

app.get('/', (req, res) => {
    Object.keys(req.cookies).forEach((cookieName) => {
        res.clearCookie(cookieName);
    });
    res.json({ message: 'Welcome to bezkoder application.' });
});

// const sslServer = https.createServer(
//     {
//         key: fs.readFileSync(path.join(__dirname, '../..', 'certs', 'private.pem')),
//         cert: fs.readFileSync(path.join(__dirname, '../..', 'certs', 'certificate.pem')),
//     },
//     app
// );

///TODO: set port, listen for requests
const PORT = process.env.SERVER_PORT || 8080;
app.listen(PORT, () => {
    logInfo(`Server is running on port ${PORT}.`, fileDetails, true);
});

// sslServer.listen(PORT, () => {
//     logInfo(`Server is running on port ${PORT}.`, fileDetails, true);
// });
