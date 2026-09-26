const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/AdminLayout.jsx', 'utf8');

const target = `          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center">
            <div className="bg-teal-500 text-white font-bold px-1.5 py-0.5 rounded text-sm mr-2">MC</div>
            <span className="text-lg font-bold text-white tracking-tight">MediCare Admin</span>
          </div>`;

const replacement = `          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center bg-white px-2 py-1 rounded-md">
            <img src="https://logoarena-storage.s3.amazonaws.com/contests/public/6154/961_1438568522_medicure.jpg" alt="MediCare Admin Logo" className="h-8 object-contain" />
          </div>`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('admin/src/admin/AdminLayout.jsx', code);
    console.log('Admin logo updated');
} else {
    // CRLF 
    if(code.includes(target.replace(/\n/g, '\r\n'))) {
        code = code.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
        fs.writeFileSync('admin/src/admin/AdminLayout.jsx', code);
        console.log('Admin logo updated with CRLF');
    } else {
        // Just try replacing the inner part
        const innerTarget = `<div className="flex items-center">\r\n            <div className="bg-teal-500 text-white font-bold px-1.5 py-0.5 rounded text-sm mr-2">MC</div>\r\n            <span className="text-lg font-bold text-white tracking-tight">MediCare Admin</span>\r\n          </div>`;
        const innerReplacement = `<div className="flex items-center bg-white px-2 py-1 rounded-md">\r\n            <img src="https://logoarena-storage.s3.amazonaws.com/contests/public/6154/961_1438568522_medicure.jpg" alt="MediCare Admin Logo" className="h-8 object-contain" />\r\n          </div>`;
        
        if (code.includes(innerTarget)) {
            code = code.replace(innerTarget, innerReplacement);
            fs.writeFileSync('admin/src/admin/AdminLayout.jsx', code);
            console.log('Admin logo updated inner CRLF');
        } else {
            console.log('Could not find admin logo code');
        }
    }
}
