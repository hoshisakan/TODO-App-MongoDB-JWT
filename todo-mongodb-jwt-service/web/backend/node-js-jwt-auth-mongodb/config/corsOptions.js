const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost',
        'https://localhost',
    ],
    methods : [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS'
    ],
    credentials: true,
    allowHeaders: [
        'Content-Type',
        'Authorization',
    ]
};

exports.corsOptions = corsOptions;