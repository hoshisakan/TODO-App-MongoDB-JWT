const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require('./user.model');
db.role = require('./role.model');
db.todo = require('./todo.model');
db.todoCategory = require('./todo.category.model');
db.traceError = require('./trace.error.model');
db.errorCategory = require('./error.category.model');

db.ROLES = ['user', 'admin', 'moderator'];

module.exports = db;
