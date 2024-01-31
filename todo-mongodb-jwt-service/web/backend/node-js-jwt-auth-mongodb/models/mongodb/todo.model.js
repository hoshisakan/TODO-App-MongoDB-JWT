const mongoose = require('mongoose');
const TodoCategory = require('./todo.category.model');
const { logInfo, logError } = require('../../utils/log.util');
const { filenameFilter } = require('../../utils/regex.util');

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const fileDetails = `[${filenameWithoutPath}]`;

const Todo = mongoose.model(
    'Todo',
    new mongoose.Schema({
        title: {
            type: String,
            required: true,
            unique: true,
            min: 3,
            max: 50,
        },
        description: {
            type: String,
            default: '',
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
            // required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TodoCategory',
            required: true,
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
