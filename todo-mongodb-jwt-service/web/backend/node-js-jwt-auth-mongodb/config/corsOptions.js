const corsOptions = {
    origin: [
        'http://192.168.1.103:3000',
        'https://192.168.1.103:3000',
        'http://localhost:3000',
        'https://localhost:3000',
        'http://localhost:3001',
        'http://localhost',
        'https://localhost',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
};

exports.corsOptions = corsOptions;
