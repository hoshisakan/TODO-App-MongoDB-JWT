const logger = require('../extensions/logger.extension');
const { stringify } = require('./json.util');

const DebugUtil = {
    logInfo: (message, fileDetails, outToConsole = false) => {
        try {
            if (!fileDetails) {
                throw new Error('Filename cannot be empty');
            }
            if (outToConsole) {
                console.log(message);
            }
            logger.info(message, { fileDetails });
        } catch (error) {
            console.log(error);
        }
    },

    logError: (err, fileDetails, outToConsole = false) => {
        try {
            if (!fileDetails) {
                throw new Error('Filename cannot be empty');
            }
            const message = err.stack;
            if (outToConsole) {
                console.log(message);
            }
            logger.error(message, { fileDetails });
        } catch (error) {
            console.log(message);
        }
    },
};

module.exports = DebugUtil;
