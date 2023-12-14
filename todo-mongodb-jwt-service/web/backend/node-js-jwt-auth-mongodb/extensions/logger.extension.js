const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');

const logDir = process.env.LOG_FILE_PATH;

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const transport = new winston.transports.DailyRotateFile({
    // filename: `${logDir}/%DATE%-photo-service.log`,
    filename: `${logDir}/web_log_%DATE%.log`,
    datePattern: 'YYYYMMDD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.printf((info) => {
            return `${info.timestamp} +08:00 [${info.level.toUpperCase()}] ${info.message}`;
        })
    ),
    transports: [transport],
});

logger.info('Backup job is running.');

module.exports = logger;
