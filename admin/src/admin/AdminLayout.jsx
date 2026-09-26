import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tag, Users, ShoppingCart, 
  FileText, Activity, AlertCircle, Settings, LogOut, Stethoscope, Calendar, Menu, X
} from 'lucide-react';
import socket from '../utils/socket';

const AdminLayout = () => {
  const location = useLocation();
  const [socketStatus, setSocketStatus] = useState('Offline');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [adminUser, setAdminUser] = useState(() => {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info) : { name: 'Admin User', role: 'Super Admin', email: '' };
  });

  useEffect(() => {
    socket.connect();
    socket.emit('join_admin_room');

    socket.on('connect', () => setSocketStatus('Live'));
    socket.on('disconnect', () => setSocketStatus('Offline'));
    socket.io.on('reconnect_attempt', () => setSocketStatus('Reconnecting'));

    const handleProfileUpdate = (e) => {
      setAdminUser(e.detail);
      const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...info, ...e.detail }));
    };
    window.addEventListener('adminProfileUpdated', handleProfileUpdate);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/admin/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <AlertCircle size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Prescriptions', path: '/admin/prescriptions', icon: <FileText size={20} /> },
    { name: 'Lab Tests', path: '/admin/lab-tests', icon: <Activity size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Doctors', path: '/admin/doctors', icon: <Stethoscope size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const adminInitials = adminUser.name ? adminUser.name.substring(0, 2).toUpperCase() : 'AD';
  const pageTitle = menuItems.find(m => location.pathname === m.path || (location.pathname.startsWith(m.path) && m.path !== '/admin'))?.name || 'Admin Panel';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center">
            <div className="bg-teal-500 text-white font-bold px-1.5 py-0.5 rounded text-sm mr-2">MC</div>
            <span className="text-lg font-bold text-white tracking-tight">MediCare Admin</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 hide-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
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
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full h-full">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-800 focus:outline-none p-1 -ml-1 rounded-md hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800 truncate hidden sm:block">
              {pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center text-xs sm:text-sm font-medium whitespace-nowrap">
              {socketStatus === 'Live' && <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span className="hidden sm:inline">Live</span></span>}
              {socketStatus === 'Reconnecting' && <span className="text-amber-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <span className="hidden sm:inline">Reconnecting...</span></span>}
              {socketStatus === 'Offline' && <span className="text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> <span className="hidden sm:inline">Offline</span></span>}
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
              {adminUser.avatar ? (
                <img src={adminUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 text-teal-700 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-xs sm:text-sm">
                  {adminInitials}
                </div>
              )}
              <div className="flex flex-col max-w-[100px] sm:max-w-[150px]">
                <span className="text-xs sm:text-sm font-bold text-slate-700 leading-tight truncate">{adminUser.name}</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 capitalize truncate">{adminUser.role?.replace('_', ' ').toLowerCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 w-full relative">
          <div className="w-full max-w-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
