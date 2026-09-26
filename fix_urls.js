
const fs = require('fs');

const PROD_URL = 'https://medicure-server-kzu6.onrender.com';
const PROD_API = PROD_URL + '/api';

const files = [
    {
        path: 'client/src/utils/api.js',
        find: /baseURL: 'http:\/\/localhost:5000\/api'/,
        replace: \aseURL: import.meta.env.VITE_API_URL || '\'\
    },
    {
        path: 'admin/src/utils/api.js',
        find: /baseURL: 'http:\/\/localhost:5000\/api'/,
        replace: \aseURL: import.meta.env.VITE_API_URL || '\'\
    },
    {
        path: 'client/src/utils/socket.js',
        find: /const URL = 'http:\/\/localhost:5000';/,
        replace: \const URL = import.meta.env.VITE_SOCKET_URL || '\';\
    },
    {
        path: 'admin/src/utils/socket.js',
        find: /const URL = 'http:\/\/localhost:5000';/,
        replace: \const URL = import.meta.env.VITE_SOCKET_URL || '\';\
    }
];

files.forEach(f => {
    if (fs.existsSync(f.path)) {
        let code = fs.readFileSync(f.path, 'utf8');
        code = code.replace(f.find, f.replace);
        fs.writeFileSync(f.path, code);
    }
});

