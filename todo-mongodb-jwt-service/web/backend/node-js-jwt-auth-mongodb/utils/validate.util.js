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
    endpoint: {
        authPoint: {
            validateRoles: ['user', 'admin', 'moderator'],
        },
        userEndpoint: {
            validateMode: ['signup', 'find'],
            authValidateRoles: ['admin'],
            findValidateFields: ['id', 'username', 'email', 'roles'],
            signUpValidateFields: ['username', 'email', 'password', 'roles'],
        },
        roleEndpoint: {
            validateMode: ['signup', 'find'],
            authValidateRoles: ['admin'],
            findValidateFields: ['id', 'name'],
        },
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
};
