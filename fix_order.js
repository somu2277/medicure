
const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/pages/AdminOrders.jsx', 'utf8');
code = code.replace(
    /http:\/\/localhost:5000\$\{selectedOrder\.prescriptionId\.fileUrl\}/g,
    '\\'
);
fs.writeFileSync('admin/src/admin/pages/AdminOrders.jsx', code);

