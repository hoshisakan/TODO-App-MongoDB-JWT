module.exports = {
    files: {
        validateImageExtensions: ['jpg', 'jpeg', 'png'],
        validateMusicExtensions: ['mp3', 'wav'],
        validateVideoExtensions: ['mp4', 'avi'],
        validateDocumentExtensions: ['doc', 'docx', 'pdf'],
        validateCompressedExtensions: ['zip', 'rar'],
        validatePresentationExtensions: ['ppt', 'pptx'],
        validateSpreadsheetExtensions: ['xls', 'xlsx'],
        validateTextExtensions: ['txt'],
        validateCodeExtensions: ['js', 'ts', 'html', 'css', 'scss', 'json', 'xml'],
    },
    queryOperator: {
        validateOperators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'or', 'and', 'not', 'nor'],
        mongoOperators: {
            eq: '$eq',
            ne: '$ne',
            gt: '$gt',
            gte: '$gte',
            lt: '$lt',
            lte: '$lte',
            in: '$in',
            nin: '$nin',
            or: '$or',
            and: '$and',
            not: '$not',
            nor: '$nor',
        },
    },
    crudOperations: {
        fieldValidation: {
            User: {
                create: ['username', 'email', 'password', 'roles'],
                update: ['username', 'email', 'password', 'roles'],
                checkDuplicate: ['username', 'email'],
            },
            Role: {
                create: ['name', 'level'],
                update: ['name', 'level'],
                checkDuplicate: ['name'],
            },
            TodoCategory: {
                create: ['name', 'value'],
                update: ['name', 'value'],
                checkDuplicate: ['name'],
            },
            Todo: {
                create: ['title', 'description', 'status', 'priority', 'isCompleted', 'type', 'startDate', 'dueDate'],
                update: ['title', 'description', 'status', 'priority', 'isCompleted', 'type', 'startDate', 'dueDate'],
                checkDuplicate: ['title'],
            },
            ErrorCategory: {
                create: ['name', 'description'],
                update: ['name', 'description'],
                checkDuplicate: ['name'],
            },
            TraceError: {
                create: ['message', 'stack', 'description', 'line', 'errorCategoryName'],
                update: ['message', 'stack', 'description', 'line', 'errorCategoryName'],
                checkDuplicate: ['message'],
            },
        },
    },
    fieldAuthenticityCheck: {
        passFieldKeys: ['_id', 'user', 'todoCategoryId', 'errorCategoryName'],
    },
};
