const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { printErrorDetails, log } = require('../utils/debug.util');

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
            backupDatetimeformat = moment().format('YYYYMMDDHHmmss');
            backupDirName = moment().format('YYYYMMDD');

            log(`backupDatetimeformat: ${backupDatetimeformat}`, true);

            backupFileName = `${this.dbName}_${backupDatetimeformat}`;
            backupFilePath = path.join(__dirname, '..', `/data_backup/${this.dbName}/${backupDirName}`);
            backupFileFullPath = path.join(backupFilePath, backupFileName);

            log(`backupFileName: ${backupFileName}`, true);
            log(`backupFilePath: ${backupFilePath}`, true);

            let tryCreatedDirCount = 0;
            const maxTryCreatedDirCount = 3;

            while (!fs.existsSync(backupFilePath) && tryCreatedDirCount < maxTryCreatedDirCount) {
                log(`backupFilePath: ${backupFilePath} not exists`, true);
                fs.mkdirSync(backupFilePath, { recursive: true }, (err) => {
                    if (err) {
                        printErrorDetails(err);
                        return;
                    }
                });
                log(`backupFilePath: ${backupFilePath} created`, true);
                tryCreatedDirCount++;
            }

            if (tryCreatedDirCount >= maxTryCreatedDirCount) {
                log(`backupFilePath: ${backupFilePath} cannot be created`, true);
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
                log(`Dialect ${this.dialect} is not supported`, true);
                return;
            }

            log(`backupCommand: ${backupCommand}`, true);

            log(`Start backup database ${this.dbName} for ${this.dialect} at ${backupDatetimeformat}`, true);

            const exec = require('child_process').exec;

            exec(backupCommand, (error, stdout, stderr) => {
                if (error) {
                    printErrorDetails(error, true);
                    return;
                }
                ///TODO: Record and write backup result to log file
                if (stderr) {
                    log(stderr, true);
                    return;
                }
            });
            log(`End backup database ${this.dbName} for ${this.dialect} at ${backupDatetimeformat}`, true);
        } catch (error) {
            printErrorDetails(error, true);
        }
    };

    start = () => {
        try {
            cron.schedule(this.cronExpreession, () => {
                this.backup();
            });
        } catch (error) {
            printErrorDetails(error, true);
        }
    };
}

module.exports = new DatabackupExtension();
