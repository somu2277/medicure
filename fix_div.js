const fs = require('fs');
let code = fs.readFileSync('client/src/components/Header.jsx', 'utf8');

code = code.replace(/<div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">\s*<div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">/, '<div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">');

fs.writeFileSync('client/src/components/Header.jsx', code);
