const mongoose = require('mongoose');

const TodoStatus = mongoose.model(
    'TodoStatus',
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
                min: 3,
                max: 50,
                unique: true,
                dropDups: true,
                enum: ['pending', 'ongoing', 'completed'],
            },
            value: {
                type: Number,
                required: true,
                min: 1,
                max: 50,
                unique: true,
                dropDups: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            updatedAt: {
                type: Date,
            },
        },
        {
            versionKey: false,
        }
    )
);

module.exports = TodoStatus;
