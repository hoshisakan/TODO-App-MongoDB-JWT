const mongoose = require('mongoose');

const TodoCategory = mongoose.model(
    'TodoCategory',
    new mongoose.Schema({
        name: {
            type: String,
            required: true,
            min: 3,
            max: 50,
            uqiue: true,
            dropDups: true,
        },
        value: {
            type: Number,
            required: true,
            min: 1,
            max: 50,
            uqiue: true,
            dropDups: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
        },
    })
);

module.exports = TodoCategory;