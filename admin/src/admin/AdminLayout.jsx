import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tag, Users, ShoppingCart, 
  FileText, Activity, AlertCircle, Settings, LogOut 
} from 'lucide-react';
import socket from '../utils/socket';

const AdminLayout = () => {
  const location = useLocation();
  const [socketStatus, setSocketStatus] = useState('Offline');

  useEffect(() => {
    socket.connect();
    socket.emit('join_admin_room');

    socket.on('connect', () => setSocketStatus('Live'));
    socket.on('disconnect', () => setSocketStatus('Offline'));
    socket.io.on('reconnect_attempt', () => setSocketStatus('Reconnecting'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <AlertCircle size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Prescriptions', path: '/admin/prescriptions', icon: <FileText size={20} /> },
    { name: 'Lab Tests', path: '/admin/lab-tests', icon: <Activity size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="bg-teal-500 text-white font-bold px-1.5 py-0.5 rounded text-sm mr-2">MC</div>
          <span className="text-lg font-bold text-white tracking-tight">MediCare Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 hide-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-teal-600/20 text-teal-400 font-medium' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {menuItems.find(m => location.pathname === m.path || (location.pathname.startsWith(m.path) && m.path !== '/admin'))?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center text-sm font-medium">
              {socketStatus === 'Live' && <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>}
              {socketStatus === 'Reconnecting' && <span className="text-amber-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Reconnecting...</span>}
              {socketStatus === 'Offline' && <span className="text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Offline</span>}
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 leading-tight">Admin User</span>
                <span className="text-[11px] text-slate-500">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
