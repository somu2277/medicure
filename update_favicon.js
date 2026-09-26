const fs = require('fs');

let clientHtml = fs.readFileSync('client/index.html', 'utf8');
clientHtml = clientHtml.replace('<link rel="icon" type="image/svg+xml" href="/vite.svg" />', '<link rel="icon" type="image/x-icon" href="https://medicure.converty.shop/favicon.ico" />');
clientHtml = clientHtml.replace('<title>Vite + React</title>', '<title>MediCare</title>');
fs.writeFileSync('client/index.html', clientHtml);

let adminHtml = fs.readFileSync('admin/index.html', 'utf8');
adminHtml = adminHtml.replace('<link rel="icon" type="image/svg+xml" href="/vite.svg" />', '<link rel="icon" type="image/x-icon" href="https://medicure.converty.shop/favicon.ico" />');
adminHtml = adminHtml.replace('<title>Vite + React</title>', '<title>MediCare Admin</title>');
fs.writeFileSync('admin/index.html', adminHtml);
