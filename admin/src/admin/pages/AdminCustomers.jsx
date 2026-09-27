import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, X, ShoppingBag } from 'lucide-react';
import api from '../../utils/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleRowClick = async (customerId) => {
    setSelectedCustomer(customerId);
    setDetailsLoading(true);
    setCustomerDetails(null);
    try {
      const { data } = await api.get(`/admin/customers/${customerId}`);
      setCustomerDetails(data);
    } catch (err) {
      console.error('Failed to load customer details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer._id} 
                    className="hover:bg-teal-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(customer._id)}
                  >
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

      {/* Modal Overlay */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-teal-600" />
                Customer Profile
              </h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                  <p>Loading details...</p>
                </div>
              ) : customerDetails ? (
                <div className="space-y-8">
                  {/* Customer Info Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
                      {customerDetails.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-slate-800">{customerDetails.customer.name}</h3>
                      <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><Mail size={14} className="text-slate-400" /> {customerDetails.customer.email}</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><Phone size={14} className="text-slate-400" /> {customerDetails.customer.phone}</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-teal-600">{customerDetails.orders.length}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ShoppingBag size={18} className="text-teal-600" />
                      Order History
                    </h4>
                    
                    {customerDetails.orders.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                        <p className="text-slate-500">This customer hasn't placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerDetails.orders.map(order => (
                          <div key={order._id} className="border border-slate-200 rounded-xl p-4 hover:border-teal-300 transition-colors bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
                              <div>
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">#{order._id.slice(-8)}</span>
                                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                  <Calendar size={12} /> {new Date(order.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                  order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {order.status}
                                </span>
                                <p className="font-bold text-slate-800 mt-1.5">₹{order.totalAmount}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm items-center">
                                  <span className="text-slate-700 flex items-center gap-2 truncate pr-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    {item.productId ? item.productId.name : 'Unknown Product'} 
                                    <span className="text-slate-400 text-xs font-medium">x{item.quantity}</span>
                                  </span>
                                  <span className="text-slate-500 font-medium">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">Failed to load details.</div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
