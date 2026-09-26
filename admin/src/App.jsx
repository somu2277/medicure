import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminAddMedicine from './admin/pages/AdminAddMedicine';
import AdminOrders from './admin/pages/AdminOrders';
import AdminInventory from './admin/pages/AdminInventory';
import AdminCategories from './admin/pages/AdminCategories';
import AdminPrescriptions from './admin/pages/AdminPrescriptions';
import AdminLabTests from './admin/pages/AdminLabTests';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminSettings from './admin/pages/AdminSettings';
import AdminLogin from './admin/pages/AdminLogin';
import AdminForgotPassword from './admin/pages/AdminForgotPassword';
import AdminDoctors from './admin/pages/AdminDoctors';
import AdminAppointments from './admin/pages/AdminAppointments';

// A simple auth wrapper (could be expanded)
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  if (!token || !['SUPER_ADMIN', 'PHARMACIST', 'INVENTORY_MANAGER', 'ORDER_MANAGER'].includes(userInfo.role)) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add-medicine" element={<AdminAddMedicine />} />
          <Route path="products/edit/:id" element={<AdminAddMedicine />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="lab-tests" element={<AdminLabTests />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="settings" element={<AdminSettings />} />
          
          <Route path="*" element={<div className="p-8 text-slate-500 text-center font-bold text-xl">404 - Admin Module Not Found</div>} />
        </Route>
        
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

