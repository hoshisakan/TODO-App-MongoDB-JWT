const mongoose = require('mongoose');

const Profile = mongoose.model(
    'Profile',
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            photoFileName: {
                type: String,
                unique: true,
            },
            // isMainPhoto: {
            //     type: Boolean,
            //     default: false,
            // },
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

module.exports = Profile;
