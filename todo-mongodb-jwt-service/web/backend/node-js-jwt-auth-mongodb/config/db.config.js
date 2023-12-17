module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 27017,
    DATABASE: process.env.DATABASE || 'TestDB',
    USERNAME: process.env.DB_USERNAME || 'hoshiyou',
    PASSWORD: process.env.DB_PASSWORD || 'test',
    AUTH_DATABASE: process.env.DB_AUTH_DATABASE || 'test',
};
