const nodemailer = require('nodemailer');
const { filenameFilter } = require('../utils/regex.util.js');
const { logInfo } = require('./log.util.js');
const { stringify } = require('./json.util.js');
const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
let fileDetails = `[${filenameWithoutPath}]`;

const EmailUtil = {
    sendMail: async (mailOptions) => {
        fileDetails = `[${filenameWithoutPath}] [createTransporter]`;
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_SENDER,
                    pass: process.env.EMAIL_PASSWORD
                },
                logger: true,
            });
            const sendResult = await transporter.sendMail(mailOptions);
            logInfo(stringify(sendResult), fileDetails, true);
            return sendResult;
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
    },
};

module.exports = EmailUtil;
