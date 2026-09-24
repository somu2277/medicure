import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
    <div className={`w-14 h-14 rounded-lg flex items-center justify-center mr-4 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState({
    stats: { totalProducts: 0, lowStockProducts: 0, totalOrders: 0, totalCustomers: 0 },
    recentOrders: [],
    lowStockAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();

    // Socket.io real-time updates
    import('../../utils/socket').then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      socket.emit('join_admin_room');

      const handleRealtimeUpdate = () => {
        console.log('Real-time update received! Refetching dashboard...');
        fetchDashboard();
      };

      socket.on('product:created', handleRealtimeUpdate);
      socket.on('product:updated', handleRealtimeUpdate);
      socket.on('product:archived', handleRealtimeUpdate);
      socket.on('order:created', handleRealtimeUpdate);
      socket.on('order:statusChanged', handleRealtimeUpdate);
      socket.on('inventory:lowStock', handleRealtimeUpdate);

      return () => {
        socket.off('product:created', handleRealtimeUpdate);
        socket.off('product:updated', handleRealtimeUpdate);
        socket.off('product:archived', handleRealtimeUpdate);
        socket.off('order:created', handleRealtimeUpdate);
        socket.off('order:statusChanged', handleRealtimeUpdate);
        socket.off('inventory:lowStock', handleRealtimeUpdate);
      };
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-slate-800 font-bold mb-6">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Orders" 
          value={data.stats.totalOrders} 
          icon={<ShoppingCart size={24} />} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Total Customers" 
          value={data.stats.totalCustomers} 
          icon={<Users size={24} />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Total Products" 
          value={data.stats.totalProducts} 
          icon={<Package size={24} />} 
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title="Low Stock Items" 
          value={data.stats.lowStockProducts} 
          icon={<AlertTriangle size={24} />} 
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Recent Orders</h3>
          {data.recentOrders.length === 0 ? (
            <div className="text-slate-500 text-sm flex items-center justify-center h-32">
              No recent orders
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentOrders.map(order => (
                <li key={order._id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{order.userId?.name || 'Guest'}</p>
                    <p className="text-slate-500">#{order._id.substring(18, 24)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{order.total}</p>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">{order.orderStatus}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Low Stock Alerts</h3>
          {data.lowStockAlerts.length === 0 ? (
            <div className="text-slate-500 text-sm flex items-center justify-center h-32">
              All items are sufficiently stocked
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.lowStockAlerts.map(prod => (
                <li key={prod._id} className="py-3 flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-800">{prod.name}</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">
                    {prod.stockQuantity} remaining
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
