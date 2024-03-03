const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = require('../../helpers/constants.helper');
const { sendMail } = require('../../utils/email.util');
const { randomBytes } = require('crypto');
const JWTUtil = require('../../utils/jwt.util');
const { stringify } = require('querystring');

class TestController {
    constructor() {
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    allAccess = (req, res) => {
        return http.successResponse(res, OK, 'Public Content.');
    };

    userBoard = (req, res) => {
        return http.successResponse(res, OK, 'User Content.');
    };

    adminBoard = (req, res) => {
        return http.successResponse(res, OK, 'Admin Content.');
    };

    moderatorBoard = (req, res) => {
        return http.successResponse(res, OK, 'Moderator Content.');
    };

    verify = (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const token = req.query.token;

            if (!token) {
                throw new Error('Invalid token.');
            }
            const decodedToken = JWTUtil.verifyToken(token, 'email-confirm');
            const verifyUserEmail = decodedToken['email'];
            
            return http.successResponse(res, OK, 'Analysis token successfully.', verifyUserEmail);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    sendVerificationEmail = (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const email = req.body.email;
            // const token = randomBytes(32).toString('hex');
            const result = JWTUtil.generateToken(
                {
                    email: email,
                },
                'email-confirm',
                'user'
            );

            if (!result.token || !result.expireTime) {
                throw new Error('Token generate failed.');
            } else {
                logInfo(`Confirm or reset result: ${stringify(result)}`, fileDetails, true);

                const mailOptions = {
                    from: process.env.EMAIL_SENDER,
                    to: email,
                    subject: 'Confirm your email address',
                    //text: `Click on this link to verify your email: http://localhost/api/v1/test/verify?token=${token}`,
                    text: `Click on this link to verify your email: http://localhost:49146/api/v1/test/verify?token=${result.token}`,
                };

                sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return http.errorResponse(res, INTERNAL_SERVER_ERROR, 'Error sending verification email.');
                    }
                });
                return http.successResponse(res, OK, 'Verification email sent.');
            }
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = TestController;
