const fs = require('fs');
let code = fs.readFileSync('admin/src/admin/pages/AdminPrescriptions.jsx', 'utf8');

const target1 = `                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-xs bg-teal-50 px-3 py-1.5 rounded border border-teal-100">
                        <FileText size={14} /> View File
                      </button>
                    </td>`;
                    
const replacement1 = `                    <td className="px-6 py-4">
                      <a 
                        href={\`\${import.meta.env.VITE_SOCKET_URL || 'https://medicure-server-kzu6.onrender.com'}\${rx.fileUrl}\`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-xs bg-teal-50 px-3 py-1.5 rounded border border-teal-100"
                      >
                        <FileText size={14} /> View File
                      </a>
                    </td>`;

const target2 = `                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>`;

const replacement2 = `                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rx.status !== 'APPROVED' && (
                            <button 
                              onClick={() => handleUpdateStatus(rx._id, 'APPROVED')}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-colors" 
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                        )}
                        {rx.status !== 'REJECTED' && (
                            <button 
                              onClick={() => handleUpdateStatus(rx._id, 'REJECTED')}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors" 
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                        )}
                      </div>
                    </td>`;

const target3 = `  useEffect(() => {`;
const replacement3 = `  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(\`/prescriptions/\${id}/status\`, { status });
      setPrescriptions(prescriptions.map(rx => rx._id === id ? { ...rx, status } : rx));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  useEffect(() => {`;

if (code.includes(target1)) code = code.replace(target1, replacement1);
else code = code.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));

if (code.includes(target2)) code = code.replace(target2, replacement2);
else code = code.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));

if (code.includes(target3)) code = code.replace(target3, replacement3);
else code = code.replace(target3.replace(/\n/g, '\r\n'), replacement3.replace(/\n/g, '\r\n'));

fs.writeFileSync('admin/src/admin/pages/AdminPrescriptions.jsx', code);
