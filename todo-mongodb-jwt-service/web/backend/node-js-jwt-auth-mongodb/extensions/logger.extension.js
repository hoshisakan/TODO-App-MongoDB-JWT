const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const moment = require('moment');
const { filenameFilter } = require('../utils/regex.util');

const logDir = process.env.LOG_FILE_PATH;

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logDate = moment().format('YYYYMMDD');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const transport = new winston.transports.DailyRotateFile({
    // filename: `${logDir}/%DATE%-photo-service.log`,
    filename: `${logDir}/${logDate}/web_log_%DATE%.log`,
    /// One hour generate one log file
    datePattern: 'YYYYMMDDHH',
    // datePattern: 'YYYYMMDDHHmm',
    // zippedArchive: true,
    // maxSize: '20m',
    // maxFiles: '14d',
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        // winston.format.printf((info) => {
        //     return `${info.timestamp} +08:00 [${info.level.toUpperCase()}] ${info.message}`;
        // })
        // winston.format.printf(({ timestamp, level, message, filename='', className='', funName='' }) => {
        //     let log = `${timestamp} +08:00 [${level.toUpperCase()}] [filename] [className] [funName] ${message}`;

        //     log = log.replace('[filename]', filename);
        //     log = log.replace('[className]', className);
        //     log = log.replace('[funName]', funName);

        //     console.log(log);

        //     return log;
        // })
        winston.format.printf(({ timestamp, level, message, fileDetails }) => {
            let log = `${timestamp} +08:00 [${level.toUpperCase()}] ${fileDetails} ${message}`;
            // console.log(log);
            return log;
        })
    ),
    transports: [transport],
});

logger.info('Backup job is running.', { fileDetails: fileDetails });

module.exports = logger;
