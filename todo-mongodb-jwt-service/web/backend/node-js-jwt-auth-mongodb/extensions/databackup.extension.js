const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { logInfo, logError } = require('../utils/log.util');
const { filenameFilter } = require('../utils/regex.util');

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
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        // const className = classAndFuncName.split('.')[0];
        // const funcName = classAndFuncName.split('.')[1];
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    backup = () => {
        let backupCommand = '';
        let backupFileName = '';
        let backupFilePath = '';
        let backupFileFullPath = '';
        let backupDatetimeformat = '';
        let backupDirName = '';
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            backupDatetimeformat = moment().format('YYYYMMDDHHmmss');
            backupDirName = moment().format('YYYYMMDD');

            logInfo(`backupDatetimeformat: ${backupDatetimeformat}`, fileDetails, true);

            backupFileName = `${this.dbName}_${backupDatetimeformat}`;
            backupFilePath = path.join(__dirname, '..', `/data_backup/${this.dbName}/${backupDirName}`);
            backupFileFullPath = path.join(backupFilePath, backupFileName);

            logInfo(`backupFileName: ${backupFileName}`, fileDetails, true);
            logInfo(`backupFilePath: ${backupFilePath}`, fileDetails, true);

            let tryCreatedDirCount = 0;
            const maxTryCreatedDirCount = 3;

            while (!fs.existsSync(backupFilePath) && tryCreatedDirCount < maxTryCreatedDirCount) {
                logInfo(`tryCreatedDirCount: ${tryCreatedDirCount}`, fileDetails, true);
                fs.mkdirSync(backupFilePath, { recursive: true }, (err) => {
                    if (err) {
                        logError(err);
                        return;
                    }
                });
                logInfo(`Created backupFilePath: ${backupFilePath}`, fileDetails, true);
                tryCreatedDirCount++;
            }

            if (tryCreatedDirCount >= maxTryCreatedDirCount) {
                logInfo(`tryCreatedDirCount: ${tryCreatedDirCount}`, fileDetails, true);
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
                logInfo(`this.dialect: ${this.dialect}`, fileDetails, true);
                return;
            }

            logInfo(`backupCommand: ${backupCommand}`, fileDetails, true);

            logInfo(
                `Start backup database ${this.dbName} for ${this.dialect} at ${backupDatetimeformat}`,
                fileDetails,
                true
            );

            const exec = require('child_process').exec;

            exec(backupCommand, (err, stdout, stderr) => {
                if (err) {
                    logError(err, fileDetails, true);
                    return;
                }
                ///TODO: Record and write backup result to log file
                if (stderr) {
                    logInfo(stderr, fileDetails, true);
                    return;
                }
            });
            logInfo(
                `End backup database ${this.dbName} for ${this.dialect} at ${backupDatetimeformat}`,
                fileDetails,
                true
            );
        } catch (err) {
            logError(err, fileDetails, true);
        }
    };

    start = () => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            cron.schedule(this.cronExpreession, () => {
                this.backup();
            });
        } catch (err) {
            logError(err, fileDetails, true);
        }
    };
}

module.exports = new DatabackupExtension();
