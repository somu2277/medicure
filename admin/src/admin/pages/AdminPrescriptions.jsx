import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/prescriptions/${id}/status`, { status });
      setPrescriptions(prescriptions.map(rx => rx._id === id ? { ...rx, status } : rx));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await api.get('/prescriptions');
        setPrescriptions(data.prescriptions || (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(rx => 
    (rx.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (rx.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rx._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search prescriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Rx ID</th>
                <th className="px-6 py-4 font-medium">Patient / Customer</th>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading prescriptions...</td></tr>
              ) : filteredPrescriptions.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No prescriptions found.</td></tr>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <tr key={rx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">#{rx._id.substring(rx._id.length - 6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{rx.userId?.name || rx.patientName || 'Unknown Patient'}</p>
                      <p className="text-xs text-slate-500">{rx.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`${import.meta.env.VITE_SOCKET_URL || 'https://medicure-server-kzu6.onrender.com'}${rx.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-xs bg-teal-50 px-3 py-1.5 rounded border border-teal-100"
                      >
                        <FileText size={14} /> View File
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                        rx.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 
                        rx.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {rx.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPrescriptions;
