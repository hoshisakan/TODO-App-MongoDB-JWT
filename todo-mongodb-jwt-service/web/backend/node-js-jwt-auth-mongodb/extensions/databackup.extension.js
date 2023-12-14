const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { printErrorDetails } = require('../utils/error.utils');

const logger = require('../extensions/logger.extension');

class DatabackupExtension {
    constructor() {
        this.authDBName = process.env.DB_AUTH_DATABASE;
        this.dbName = process.env.DATABASE;
        this.dbUsername = process.env.DB_USERNAME;
        this.dbPassword = process.env.DB_PASSWORD;
        this.dbHost = process.env.DB_HOST;
        this.dbPort = process.env.DB_PORT;
        this.dialect = process.env.DB_DIALECT;
        this.cronExpreession = process.env.CRON_EXPRESSION;
    }

    backup = () => {
        let backupCommand = '';
        let backupFileName = '';
        let backupFilePath = '';
        let backupFileFullPath = '';
        let backupDatetimeformat = '';
        let backupDirName = '';

        try {
            // backupDatetimeformat = new Date()
            // .replace(/T/, '')
            // .replace(/Z/, '')
            // .replace(/-/g, '')
            // .replace(/:/g, '');
            // .substring(0, 14);

            backupDatetimeformat = moment().format('YYYYMMDDHHmmss');
            backupDirName = moment().format('YYYYMMDD');

            console.log(`backupDatetimeformat: ${backupDatetimeformat}`);
            logger.info(`backupDatetimeformat: ${backupDatetimeformat}`);
            backupFileName = `${this.dbName}_${backupDatetimeformat}`;
            backupFilePath = path.join(__dirname, '..', `/data_backup/${this.dbName}/${backupDirName}`);
            backupFileFullPath = path.join(backupFilePath, backupFileName);

            console.log(`backupFileName: ${backupFileName}`);
            console.log(`backupFilePath: ${backupFilePath}`);
            logger.info(`backupFileName: ${backupFileName}`);
            logger.info(`backupFilePath: ${backupFilePath}`);

            let tryCreatedDirCount = 0;
            const maxTryCreatedDirCount = 3;

            while (!fs.existsSync(backupFilePath) && tryCreatedDirCount < maxTryCreatedDirCount) {
                // console.log(`backupFilePath: ${backupFilePath} does not exist`);
                logger.info(`backupFilePath: ${backupFilePath} does not exist`);
                fs.mkdirSync(backupFilePath, { recursive: true }, (err) => {
                    if (err) {
                        // console.log(`backupFilePath: ${backupFilePath} cannot be created`);
                        logger.info(`backupFilePath: ${backupFilePath} cannot be created`);
                        printErrorDetails(err);
                        return;
                    }
                });
                // console.log(`backupFilePath: ${backupFilePath} created`);
                logger.info(`backupFilePath: ${backupFilePath} created`);
                tryCreatedDirCount++;
            }

            if (tryCreatedDirCount >= maxTryCreatedDirCount) {
                console.log(`backupFilePath: ${backupFilePath} does not exist and cannot be created`);
                return;
            }

            if (this.dialect === 'mysql') {
                backupCommand = `mysqldump --defaults-file=${this.configFullPath} -h ${this.dbHost} -u ${this.dbUsername} ${this.dbName} > ${backupFileFullPath}.sql`;
            } else if (this.dialect === 'postgres') {
                backupCommand = `pg_dump -U ${this.dbUsername} -h ${this.dbHost} -p ${this.dbPort} -d ${this.dbName} -f ${backupFileFullPath}.dump`;
            } else if (this.dialect === 'mssql') {
                backupCommand = `sqlcmd -S ${this.dbHost} -U ${this.dbUsername} -P ${this.dbPassword} -Q "BACKUP DATABASE ${this.dbName} TO DISK = '${backupFileFullPath}'"`;
            } else if (this.dialect === 'mongodb') {
                backupCommand = `mongodump "mongodb://${this.dbUsername}:${this.dbPassword}@${this.dbHost}:${this.dbPort}/${this.dbName}" --authenticationDatabase=${this.authDBName} --gzip --archive=${backupFileFullPath}.gz`;
            } else {
                console.log(`dialect ${this.dialect} is not supported`);
                return;
            }

            console.log(`backupCommand: ${backupCommand}`);

            logger.info(`backupCommand: ${backupCommand}`);

            // console.log(`Starting backup database ${this.dbName} for ${this.dialect} at ${new Date().toISOString()}`);

            logger.info(`Starting backup database ${this.dbName} for ${this.dialect} at ${new Date().toISOString()}`);

            const exec = require('child_process').exec;

            exec(backupCommand, (error, stdout, stderr) => {
                if (error) {
                    printErrorDetails(error);
                    return;
                }
                if (stderr) {
                    // console.log(`stderr: ${stderr}`);
                    logger.info(`stderr: ${stderr}`);
                    return;
                }
                // console.log(`stdout: ${stdout}`);
                // logger.info(`stdout: ${stdout}`);
            });
            // console.log(`Finish backup database ${this.dbName} for ${this.dialect} at ${new Date().toISOString()}`);
            logger.info(`Finish backup database ${this.dbName} for ${this.dialect} at ${new Date().toISOString()}`);
        } catch (error) {
            printErrorDetails(error);
        }
    };

    start = () => {
        /// '*/2 * * * * *' => run every 2 seconds
        cron.schedule(this.cronExpreession, () => {
            // console.log(
            //     `db name: ${this.dbName}, db username: ${this.dbUsername}, db password: ${this.dbPassword},
            //     db host: ${this.dbHost}, db port: ${this.dbPort}, dialect: ${this.dialect}`
            // );
            // console.log('Running a job at 00:00 at America/Sao_Paulo timezone');
            this.backup();
        });
    };
}

module.exports = DatabackupExtension;
