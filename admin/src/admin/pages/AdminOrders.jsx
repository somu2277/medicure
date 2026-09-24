import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import api from '../../utils/api';
import socket from '../../utils/socket';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (!socket.connected) socket.connect();
    
    const handleRealtimeUpdate = () => {
      fetchOrders();
    };

    socket.on('order:created', handleRealtimeUpdate);
    socket.on('order:statusChanged', handleRealtimeUpdate);

    return () => {
      socket.off('order:created', handleRealtimeUpdate);
      socket.off('order:statusChanged', handleRealtimeUpdate);
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      // The socket event will trigger a refetch, but we could optimistic update here
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{order.userId?.name || 'Guest User'}</p>
                      <p className="text-xs text-slate-500">{order.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.orderStatus} 
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-slate-200 cursor-pointer ${
                          order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                          order.orderStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                          order.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="View Order">
                        <Eye size={18} />
                      </button>
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

export default AdminOrders;
