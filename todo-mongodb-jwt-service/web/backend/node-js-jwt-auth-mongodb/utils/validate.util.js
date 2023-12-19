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
            validateRoles: ['admin'],
            validateFields: ['id', 'username', 'email', 'roles'],
        },
        roleEndpoint: {
            validateRoles: ['admin'],
            validateFields: ['id', 'name'],
        },
    },
};
