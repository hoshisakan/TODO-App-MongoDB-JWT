const logger = require('../extensions/logger.extension');
const { stringify } = require('./json.util');


const DebugUtil = {
    log: (message, outToConsole = false) => {
        if (outToConsole) {
            console.log(message);
        }
        logger.info(message);
    },

    printErrorDetails: (err, outToConsole = false) => {
        if (outToConsole) {
            console.error(err.stack);
        }
        logger.error(err.stack);
    },
};

module.exports = DebugUtil;
