import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../utils/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/admin/customers');
        setCustomers(data.users || data.customers || (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No customers found.</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{customer.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p className="text-sm flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {customer.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                        customer.role === 'CUSTOMER' ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400"/>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        Active
                      </span>
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

export default AdminCustomers;
