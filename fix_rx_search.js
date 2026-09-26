const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/pages/AdminPrescriptions.jsx', 'utf8');

const target1 = `  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);`;
const replacement1 = `  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');`;
code = code.replace(target1, replacement1) || code.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));

const target2 = `  return (`;
const replacement2 = `  const filteredPrescriptions = prescriptions.filter(rx => 
    (rx.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (rx.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rx._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (`;
code = code.replace(target2, replacement2) || code.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));

const target3 = `            <input 
              type="text" 
              placeholder="Search prescriptions..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />`;
const replacement3 = `            <input 
              type="text" 
              placeholder="Search prescriptions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />`;
code = code.replace(target3, replacement3) || code.replace(target3.replace(/\n/g, '\r\n'), replacement3.replace(/\n/g, '\r\n'));

const target4 = `            ) : prescriptions.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No prescriptions found.</td></tr>
            ) : (
              prescriptions.map((rx) => (`;
const replacement4 = `            ) : filteredPrescriptions.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No prescriptions found matching your search.</td></tr>
            ) : (
              filteredPrescriptions.map((rx) => (`;
code = code.replace(target4, replacement4) || code.replace(target4.replace(/\n/g, '\r\n'), replacement4.replace(/\n/g, '\r\n'));

fs.writeFileSync('admin/src/admin/pages/AdminPrescriptions.jsx', code);
