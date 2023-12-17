const logger = require('../extensions/logger.extension');

const DebugHelper = {
    log: (message, outToConsole=false) => {
        if (outToConsole) {
            console.log(message);
        }
        logger.info(message);
    },

    printErrorDetails: (err, outToConsole=false) => {
        if (outToConsole) {
            console.error(err.message);
        }
        logger.error(err.stack);
    },
};

module.exports = DebugHelper;
