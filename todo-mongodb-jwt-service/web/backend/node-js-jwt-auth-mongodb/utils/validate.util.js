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
                createOrUpdate: ['username', 'email', 'password', 'roles'],
            },
            Role: {
                createOrUpdate: ['name'],
            },
            TodoCategory: {
                createOrUpdate: ['name', 'value'],
            },
            Todo: {
                createOrUpdate: ['title', 'description', 'status', 'priority', 'isCompleted', 'type', 'startDate', 'dueDate'],
            },
        },
    },
};
