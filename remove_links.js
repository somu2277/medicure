const fs = require('fs');
let code = fs.readFileSync('client/src/components/Header.jsx', 'utf8');

const target1 = `            <Link to="/plus" className="hover:text-primary transition-colors cursor-pointer py-3">
              PLUS
            </Link>
            
            <Link to="/health-blogs" className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3">
              Health Insights <ChevronDown size={14} className="text-slate-400"/>
            </Link>`;

const target2 = `              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Offers</Link>
              <Link to="/health-blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Health Insights</Link>`;
              
const replacement2 = `              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Offers</Link>`;

if (code.includes(target1)) {
    code = code.replace(target1, '');
} else if (code.includes(target1.replace(/\n/g, '\r\n'))) {
    code = code.replace(target1.replace(/\n/g, '\r\n'), '');
} else {
    console.log("Could not find target1");
}

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
} else if (code.includes(target2.replace(/\n/g, '\r\n'))) {
    code = code.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));
} else {
    console.log("Could not find target2");
}

fs.writeFileSync('client/src/components/Header.jsx', code);
