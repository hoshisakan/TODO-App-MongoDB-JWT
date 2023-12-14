const logger = require('../extensions/logger.extension');

const DebugHelper = {
    log: (message) => {
        console.log(message);
        logger.info(message);
    },

    printErrorDetails: (err) => {
        console.log(err.stack);
        logger.error(err.stack);
    },
};

module.exports = DebugHelper;
