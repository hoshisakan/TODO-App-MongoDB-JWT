const JsonUtil = {
    parse: (text) => {
        try {
            return JSON.parse(text);
        } catch (error) {
            return null;
        }
    },

    stringify: (value, replacer, space=4) => {
        try {
            return JSON.stringify(value, replacer, space);
        } catch (error) {
            return null;
        }
    }
};

module.exports = JsonUtil;