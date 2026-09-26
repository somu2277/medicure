const fs = require('fs');
let code = fs.readFileSync('client/src/components/Header.jsx', 'utf8');

const target = `          {/* Logo Section */}
          <Link to="/" className="flex flex-col justify-center flex-shrink-0">
            <span className="text-[10px] italic text-primary/80 font-medium leading-none mb-0.5 ml-6">Take it easy</span>
            <div className="flex items-center gap-1.5">
              <div className="bg-primary text-white font-bold text-lg px-1.5 py-0.5 rounded flex items-center justify-center" style={{borderRadius: '8px 0 8px 0'}}>MC</div>
              <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">MediCare</span>
            </div>
          </Link>`;

const replacement = `          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center flex-shrink-0">
            <img src="https://logoarena-storage.s3.amazonaws.com/contests/public/6154/961_1438568522_medicure.jpg" alt="MediCare Logo" className="h-10 md:h-12 mix-blend-multiply object-contain" />
          </Link>`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('client/src/components/Header.jsx', code);
    console.log('Client logo updated');
} else {
    // CRLF 
    if(code.includes(target.replace(/\n/g, '\r\n'))) {
        code = code.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
        fs.writeFileSync('client/src/components/Header.jsx', code);
        console.log('Client logo updated with CRLF');
    } else {
        console.log('Could not find client logo code');
    }
}
