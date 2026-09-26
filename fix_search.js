const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/pages/AdminCustomers.jsx', 'utf8');

// Add searchTerm state
const target1 = `  const [detailsLoading, setDetailsLoading] = useState(false);`;
const replacement1 = `  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');`;
code = code.replace(target1, replacement1) || code.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));

// Add filteredCustomers logic before return
const target2 = `  return (`;
const replacement2 = `  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  return (`;
code = code.replace(target2, replacement2) || code.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));

// Add input value and onChange
const target3 = `            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />`;
const replacement3 = `            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />`;
code = code.replace(target3, replacement3) || code.replace(target3.replace(/\n/g, '\r\n'), replacement3.replace(/\n/g, '\r\n'));

// Change customers.map to filteredCustomers.map
const target4 = `            ) : customers.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No customers found.</td></tr>
            ) : (
              customers.map((customer) => (`;
const replacement4 = `            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No customers found matching your search.</td></tr>
            ) : (
              filteredCustomers.map((customer) => (`;
code = code.replace(target4, replacement4) || code.replace(target4.replace(/\n/g, '\r\n'), replacement4.replace(/\n/g, '\r\n'));

fs.writeFileSync('admin/src/admin/pages/AdminCustomers.jsx', code);
