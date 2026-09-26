const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/pages/AdminOrders.jsx', 'utf8');
code = code.replace(
    /http:\/\/localhost:5000\$\{/g,
    '${import.meta.env.VITE_SOCKET_URL || \'https://medicure-server-kzu6.onrender.com\'}${`
);
fs.writeFileSync('admin/src/admin/pages/AdminOrders.jsx', code);
