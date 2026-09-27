import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MedicinesPage from './pages/MedicinesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PlaceholderPage from './pages/PlaceholderPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LabTestsPage from './pages/LabTestsPage';
import LabTestDetailPage from './pages/LabTestDetailPage';
import HealthInsightsPage from './pages/HealthInsightsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AskEasyPage from './pages/AskEasyPage';

// Doctor Portal Imports
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import VideoConsultation from './pages/doctor/VideoConsultation';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/lab-tests" element={<LabTestsPage />} />
            <Route path="/lab-tests/:id" element={<LabTestDetailPage />} />
            <Route path="/health-insights" element={<HealthInsightsPage />} />
            <Route path="/health-insights/:id" element={<ArticleDetailPage />} />
            
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/order/:id" element={<OrderTrackingPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/ask-easy" element={<AskEasyPage />} />
            
            {/* Doctor Portal Routes */}
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/consultation/:id" element={<VideoConsultation />} />
            
            {/* Catch-all for undefined customer routes */}
            <Route path="*" element={<PlaceholderPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
