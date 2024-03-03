const mongoose = require('mongoose');

const Role = mongoose.model(
    'Role',
    new mongoose.Schema({
        name: {
            type: String,
            enum: ['user', 'admin', 'moderator', 'guest', 'superadmin', 'tester', 'testadd3', 'testadd2', 'development'],
            required: true,
            unique: true,
            dropDups: true,
        },
        level: {
            type: Number,
            min: 1,
            max: 99,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 99],
            default: 1,
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
    })
);

module.exports = Role;
