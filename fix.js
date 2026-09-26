
const fs = require('fs');
let paths = ['admin/src/admin/pages/AdminAppointments.jsx', 'client/src/pages/DashboardPage.jsx'];
for (let p of paths) {
    let code = fs.readFileSync(p, 'utf8');
    code = code.split('\\\\\').join('\');
    code = code.split('\\\\$').join('$');
    fs.writeFileSync(p, code);
}

