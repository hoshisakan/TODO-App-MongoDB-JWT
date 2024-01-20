const mongoose = require('mongoose');

const TraceError = mongoose.model(
    'TraceError',
    new mongoose.Schema({
        message: {
            type: String,
            required: true,
            min: 6,
            max: 50,
        },
        stack: {
            type: String,
            // required: true,
            min: 6,
            max: 500,
        },
        description: {
            type: String,
            // required: true,
            min: 6,
            max: 500,
        },
        line: {
            type: Number,
            // required: true,
        },
        errorCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ErrorCategory',
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    })
);

module.exports = TraceError;
