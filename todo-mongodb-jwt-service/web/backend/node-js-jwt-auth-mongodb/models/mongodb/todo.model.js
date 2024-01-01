const mongoose = require('mongoose');

const Todo = mongoose.model(
    'Todo',
    new mongoose.Schema({
        title: {
            type: String,
            required: true,
            min: 3,
            max: 50,
        },
        description: {
            type: String,
            required: true,
            min: 3,
            max: 200,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'ongoing', 'completed', 'deleted', 'archived'],
        },
        priority: {
            type: String,
            required: true,
            enum: ['low', 'medium', 'high'],
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            required: true,
            enum: ['public', 'private'],
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        categories: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TodoCategory',
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

module.exports = Todo;
