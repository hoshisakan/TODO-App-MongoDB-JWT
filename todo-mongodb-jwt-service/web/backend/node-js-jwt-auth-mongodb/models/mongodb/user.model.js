const mongoose = require('mongoose');

const User = mongoose.model(
    'User',
    new mongoose.Schema(
        {
            username: {
                type: String,
                required: true,
                min: 6,
                max: 50,
                uqiue: true,
                dropDups: true,
            },
            email: {
                type: String,
                required: true,
                min: 6,
                max: 50,
                uqiue: true,
                dropDups: true,
            },
            password: {
                type: String,
                required: true,
                min: 8,
                max: 15,
            },
            isActivate: {
                type: Boolean,
                default: false
            },
            roles: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Role',
                },
            ],
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

module.exports = User;
