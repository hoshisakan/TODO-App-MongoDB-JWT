module.exports = {
    generateTokenDto: {
        oldToken: {
            type: 'string',
            required: true,
        },
        payload: {
            type: 'object',
            required: true,
        },
        authType: {
            type: 'string',
            required: true,
        },
        roleHighestPermission: {
            type: 'string',
            required: true,
        },
    }
}