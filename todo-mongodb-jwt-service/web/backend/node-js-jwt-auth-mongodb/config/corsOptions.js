const corsOptions = {
    origin: [
        'http://192.168.1.103:3000',
        'https://192.168.1.103:3000',
        'http://localhost:3000',
        'https://localhost:3000',
        'http://localhost:3001',
        'http://localhost',
        'https://localhost',
        'http://dragtodo.serveirc.com',
        'https://dragtodo.serveirc.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
};

exports.corsOptions = corsOptions;
