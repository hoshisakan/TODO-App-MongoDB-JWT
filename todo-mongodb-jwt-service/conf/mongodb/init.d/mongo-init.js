console.log('Starting init script...');

const user = 'hoshiyou';
const password = 'NormalPassword12345';
const dbNames = ['TestDB', 'RealDB'];

db = db.getSiblingDB(dbNames[0]);

db.createUser({
    user: user,
    pwd: password,
    roles: [
        {
            role: 'readWrite',
            db: dbNames[0],
        },
    ],
});

db.getSiblingDB(dbNames[1]);

db.createUser({
    user: user,
    pwd: password,
    roles: [
        {
            role: 'readWrite',
            db: dbNames[1],
        },
    ],
});

console.log('Init script finished.');