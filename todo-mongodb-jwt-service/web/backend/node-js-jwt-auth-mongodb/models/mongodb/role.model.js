const mongoose = require('mongoose');

const Role = mongoose.model(
    'Role',
    new mongoose.Schema({
        name: {
            type: String,
            enum: ['user', 'admin', 'moderator', 'guest', 'superadmin', 'tester'],
            required: true,
            uqiue: true,
            dropDups: true,
        },
        level: {
            type: Number,
            min: 1,
            max: 10,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            default: 1,
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

module.exports = Role;
