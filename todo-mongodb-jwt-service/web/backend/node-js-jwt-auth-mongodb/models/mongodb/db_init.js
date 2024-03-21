const db = require('./index.js');
const config = require('../../config/db.config.js');
const Role = db.role;
const ErrorCategory = db.errorCategory;
const Profile = db.profile;
const TodoCategory = db.todoCategory;
const Todo = db.todo;
const User = db.user;

const { logError, logInfo } = require('../../utils/log.util.js');
const { stringify } = require('../../utils/json.util.js');
const { filenameFilter } = require('../../utils/regex.util.js');
const TodoStatus = require('./todo.status.model.js');

const connectionString = `mongodb://${config.USERNAME}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}?authSource=${config.AUTH_DATABASE}`;

const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();

const fileDetails = `[${filenameWithoutPath}]`;

const createConnection = async () => {
    try {
        const conn = await db.mongoose.connect(connectionString, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        logInfo(`Successfully connected to the mongodb database.`, fileDetails, true);
        await initial();
        return conn;
    } catch (error) {
        logError(error, fileDetails, true);
        process.exit();
    }
};

const dropDatabase = async () => {
    try {
        const result = await db.mongoose.connection.db.dropDatabase();
        logInfo(`result: ${result}`, fileDetails, true);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const dropCollection = async (collectionName) => {
    try {
        const result = await db.mongoose.connection.db.dropCollection(collectionName);
        logInfo(`Drop collection result: ${stringify(result)}`, fileDetails, true);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const dropAllCollections = async () => {
    try {
        const collections = await db.mongoose.connection.db.listCollections().toArray();
        logInfo(`Drop all collections result: ${stringify(collections)}`, fileDetails, true);
        await Promise.all(
            collections.map(async (collection) => {
                await dropCollection(collection.name);
            })
        );
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const truncateCollection = async (collectionName) => {
    try {
        const result = await db.mongoose.connection.db.collection(collectionName).deleteMany({});
        logInfo(`Truncate collection result: ${result}`, fileDetails, true);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const truncateAllCollections = async () => {
    try {
        const collections = await db.mongoose.connection.db.listCollections().toArray();
        logInfo(`Truncate all collections: ${collections}`, fileDetails, true);
        await Promise.all(
            collections.map(async (collection) => {
                await truncateCollection(collection.name);
            })
        );
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const createRoles = async () => {
    try {
        await Promise.all([
            new Role({ name: 'user', level: 1 }).save(),
            new Role({ name: 'moderator', level: 2 }).save(),
            new Role({ name: 'admin', level: 10 }).save(),
        ]);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const createTodoStatuses = async () => {
    try {
        await Promise.all([
            new TodoStatus({ name: 'pending', value: 1 }).save(),
            new TodoStatus({ name: 'ongoing', value: 2 }).save(),
            new TodoStatus({ name: 'completed', value: 3 }).save(),
        ]);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const createTodoCategories = async () => {
    try {
        await Promise.all([
            new TodoCategory({ name: 'Health', value: 1 }).save(),
            new TodoCategory({ name: 'Work', value: 2 }).save(),
            new TodoCategory({ name: 'Personal', value: 3 }).save(),
            new TodoCategory({ name: 'Family', value: 4 }).save(),
            new TodoCategory({ name: 'Entertainment', value: 5 }).save(),
            new TodoCategory({ name: 'Social', value: 6 }).save(),
            new TodoCategory({ name: 'Financial', value: 7 }).save(),
            new TodoCategory({ name: 'Academic', value: 8 }).save(),
            new TodoCategory({ name: 'Volunteering', value: 9 }).save(),
            new TodoCategory({ name: 'Other', value: 10 }).save(),
        ]);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const createErrorCategories = async () => {
    try {
        await Promise.all([
            new ErrorCategory({ name: 'system crashed ', description: 'For records system crashed' }).save(),
            new ErrorCategory({ name: 'cache', description: 'For records cached operator result' }).save(),
            new ErrorCategory({ name: 'database', description: 'For records database operator result' }).save(),
            new ErrorCategory({ name: 'process', description: 'For records process operator result' }).save(),
        ]);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const checkRolesExistsAndCreate = async () => {
    try {
        const result = await Role.estimatedDocumentCount();
        logInfo(`Roles count: ${result}`, fileDetails, true);
        if (result === 0) {
            await createRoles();
        }
        // else {
        //     logInfo(`Roles already exists.`, fileDetails, true);
        //     await dropCollection('Roles');
        //     await createRoles();
        //     // logInfo(`Roles recreated.`, fileDetails, true);
        // }
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const checkTodoStatusesExistsAndCreate = async () => {
    try {
        const result = await TodoStatus.estimatedDocumentCount();
        logInfo(`Todo statuses count: ${result}`, fileDetails, true);
        if (result === 0) {
            await createTodoStatuses();
        }
        // else {
        //     logInfo(`Statuses already exists.`, fileDetails, true);
        //     await dropCollection('TodoStatuses');
        //     await createTodoStatuses();
        //     // logInfo(`Todo statuses recreated.`, fileDetails, true);
        // }
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const checkTodoCategoriesExistsAndCreate = async () => {
    try {
        const result = await TodoCategory.estimatedDocumentCount();
        logInfo(`Todo categories count: ${result}`, fileDetails, true);
        if (result === 0) {
            await createTodoCategories();
        }
        // else {
        //     logInfo(`Todo ctegories already exists.`, fileDetails, true);
        //     await dropCollection('TodoCategories');
        //     await createTodoCategories();
        //     // logInfo(`Todo categories recreated.`, fileDetails, true);
        // }
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const checkErrorCategoriesExistsAndCreate = async () => {
    try {
        const result = await ErrorCategory.estimatedDocumentCount();
        logInfo(`Error categories count: ${result}`, fileDetails, true);
        if (result === 0) {
            await createErrorCategories();
        }
        // else {
        //     logInfo(`Error categories already exists.`, fileDetails, true);
        //     await dropCollection('ErrorCategories');
        //     // await createErrorCategories();
        //     // logInfo(`Error categories recreated.`, fileDetails, true);
        // }
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const isIndexExistsInCollection = (indexInformation, name) => {
    return indexInformation.some((index) => index.name === name);
};

///TODO: Create index
const createIndexes = async () => {
    try {
        const indexProfileInformation = await Profile.collection.indexInformation({ full: true });
        const isProfilePhotoFileNameExists = isIndexExistsInCollection(indexProfileInformation, 'photoFileName_1');

        if (!isProfilePhotoFileNameExists) {
            await Profile.createIndexes({ key: { photoFileName: 1 }, name: 'photoFileName_1', unique: true });
            logInfo(`Create profile indexs photoFileName completed.`, fileDetails);
        }

        const indexRoleInformation = await Role.collection.indexInformation({ full: true });
        const isRoleNameExists = isIndexExistsInCollection(indexRoleInformation, 'name_1');
        const isRoleValueExists = isIndexExistsInCollection(indexRoleInformation, 'value_1');

        if (!isRoleNameExists) {
            await Role.createIndexes({ key: { name: 1 }, name: 'name_1', unique: true });
            logInfo(`Create role collection that indexs name completed.`, fileDetails);
        }
        if (!isRoleValueExists) {
            await Role.createIndexes({ key: { level: 1 }, name: 'level_1', unique: true });
            logInfo(`Create role collection that indexs level completed.`, fileDetails);
        }

        const indexErrorCategoryInformation = await ErrorCategory.collection.indexInformation({ full: true });
        const isErrorCategoryNameExists = isIndexExistsInCollection(indexErrorCategoryInformation, 'name_1');

        if (!isErrorCategoryNameExists) {
            await ErrorCategory.createIndexes({ key: { name: 1 }, name: 'name_1', unique: true });
            logInfo(`Create error category collection that indexs name completed.`, fileDetails);
        }

        const indexTodoCategoryInformation = await TodoCategory.collection.indexInformation({ full: true });
        const isTodoCategoryNameExists = isIndexExistsInCollection(indexTodoCategoryInformation, 'name_1');
        const isTodoCategoryValueExists = isIndexExistsInCollection(indexTodoCategoryInformation, 'value_1');

        if (!isTodoCategoryNameExists) {
            await TodoCategory.createIndexes({ key: { name: 1 }, name: 'name_1', unique: true });
            logInfo(`Create todo category collection that indexs name completed.`, fileDetails);
        }
        if (!isTodoCategoryValueExists) {
            await TodoCategory.createIndexes({ key: { value: 1 }, name: 'value_1', unique: true });
            logInfo(`Create todo category collection that indexs value completed.`, fileDetails);
        }

        const indexTodoStatusInformation = await TodoStatus.collection.indexInformation({ full: true });
        const isTodoStatusNameExists = isIndexExistsInCollection(indexTodoStatusInformation, 'name_1');
        const isTodoStatusValueExists = isIndexExistsInCollection(indexTodoStatusInformation, 'value_1');

        if (!isTodoStatusNameExists) {
            await TodoStatus.createIndexes({ key: { name: 1 }, name: 'name_1', unique: true });
            logInfo(`Create todo status collection that indexs name completed.`, fileDetails);
        }
        if (!isTodoStatusValueExists) {
            await TodoStatus.createIndexes({ key: { value: 1 }, name: 'value_1', unique: true });
            logInfo(`Create todo status collection that indexs value completed.`, fileDetails);
        }

        const indexTodoInformation = await Todo.collection.indexInformation({ full: true });
        const isTodoPhotoFileNameExists = isIndexExistsInCollection(indexTodoInformation, 'photoFileName_1');

        if (!isTodoPhotoFileNameExists) {
            await Todo.createIndexes({ key: { title: 1 }, name: 'title_1', unique: true });
            logInfo(`Create todo collection that indexs title completed.`, fileDetails);
        }
        // await listIndexes();
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

///TODO List all index
const listIndexes = async () => {
    try {
        const profileIndexes = await Profile.listIndexes();
        logInfo(`List profile indexs: ${stringify(profileIndexes)}`, fileDetails);
        const todoIndexes = await Todo.listIndexes();
        logInfo(`List todo indexs: ${stringify(todoIndexes)}`, fileDetails);
        const todoCategoryIndexes = await TodoCategory.listIndexes();
        logInfo(`List todo category indexs: ${stringify(todoCategoryIndexes)}`, fileDetails);
        const errorCategoryIndexes = await ErrorCategory.listIndexes();
        logInfo(`List error category indexs: ${stringify(errorCategoryIndexes)}`, fileDetails);
        const roleIndexes = await Role.listIndexes();
        logInfo(`List role indexs: ${stringify(roleIndexes)}`, fileDetails);
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

///TODO: Drop index
const dropIndexes = async () => {
    try {
        ///TODO: Not working after execute
        // await Profile.dropIndex({ photoUrlOrPath: 1 });
        ///TODO: Not working, because not found the dropIndexes method
        // await Profile.dropIndexes();
        await db.mongoose.connection.db.collection('profiles').dropIndexes();
        logInfo(`Drop profile indexs completed.`, fileDetails);
        // await Role.dropIndex({ name: 1, level: 1 });
        // logInfo(`Drop role indexs completed.`, fileDetails);
        // await ErrorCategory.dropIndex({ name: 1 });
        // logInfo(`Drop error category indexs completed.`, fileDetails);
        // await TodoCategory.dropIndex({ name: 1, value: 1 });
        // logInfo(`Drop todo category indexs completed.`, fileDetails);
        // await Todo.dropIndex({ title: 1 });
        // logInfo(`Drop todo indexs completed.`, fileDetails);
        await listIndexes();
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

const initial = async () => {
    try {
        await checkRolesExistsAndCreate();
        await checkErrorCategoriesExistsAndCreate();
        await checkTodoStatusesExistsAndCreate();
        await checkTodoCategoriesExistsAndCreate();
        // await listIndexes();
        // await dropIndexes();
        await createIndexes();
    } catch (error) {
        logError(error, fileDetails, true);
    }
    return;
};

createConnection();
