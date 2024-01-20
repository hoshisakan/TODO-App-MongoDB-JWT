const mongoose = require('mongoose');

const ErrorCategory = mongoose.model(
    'ErrorCategory',
    new mongoose.Schema({
        name: {
            type: String,
            required: true,
            min: 6,
            max: 50,
        },
        description: {
            type: String,
            // required: true,
            min: 6,
            max: 500,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    })
);

module.exports = ErrorCategory;