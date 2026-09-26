import React, { useState, useEffect } from 'react';
import { Save, Shield, Bell, CreditCard, Building, User, Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
    </div>
  );
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // States
  const [settings, setSettings] = useState({
    platformName: '', supportEmail: '', customerCarePhone: '', freeDeliveryThreshold: 0, standardDeliveryFee: 0,
    notifications: { newOrder: false, prescriptionUpload: false, labTestBooking: false, doctorAppointment: false, paymentConfirmation: false, securityAlerts: false },
    twoFactorEnabled: false
  });

  const [profile, setProfile] = useState({ name: '', phone: '', username: '', email: '', avatar: '' });
  
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data.settings) setSettings(data.settings);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/admin/profile');
      if (data.admin) setProfile({ ...data.admin, username: data.admin.username || '', avatar: data.admin.avatar || '' });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await api.put('/admin/settings', settings);
      showToast('Settings saved successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/admin/profile', {
        name: profile.name, phone: profile.phone, username: profile.username, avatar: profile.avatar
      });
      showToast('Profile updated successfully');
      
      // Dispatch event to update Header layout
      const event = new CustomEvent('adminProfileUpdated', { detail: data.admin });
      window.dispatchEvent(event);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [loginEmail, setLoginEmail] = useState({ currentPassword: '', newEmail: '', confirmEmail: '', otp: '' });
  const [emailChangeStep, setEmailChangeStep] = useState(1);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestEmailChange = async (e) => {
    if (e) e.preventDefault();
    if (loginEmail.newEmail !== loginEmail.confirmEmail) return showToast('Emails do not match', 'error');
    
    setLoading(true);
    try {
      const res = await api.post('/admin/request-email-change', { currentPassword: loginEmail.currentPassword, newEmail: loginEmail.newEmail });
      showToast(res.data.message || 'OTP sent successfully.');
      setEmailChangeStep(2);
      setResendCooldown(60);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to request email change', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/verify-email-change', { otp: loginEmail.otp });
      showToast('Login email changed successfully. Please login again with new email.');
      setLoginEmail({ currentPassword: '', newEmail: '', confirmEmail: '', otp: '' });
      setEmailChangeStep(1);
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
      }, 2000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return showToast('Passwords do not match', 'error');
    
    // Check strength (min 8 char, upper, lower, num, special)
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(passwordForm.newPassword)) {
      return showToast('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.', 'error');
    }

    setLoading(true);
    try {
      await api.put('/admin/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      showToast('Password changed successfully. Please login again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
      }, 2000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <Building size={18} /> },
    { id: 'profile', name: 'Admin Profile', icon: <User size={18} /> },
    { id: 'login', name: 'Login & Password', icon: <Key size={18} /> },
    { id: 'security', name: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'payments', name: 'Payments & Delivery', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Platform Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage core configuration for the MediCare platform.</p>
        </div>
        {(activeTab === 'general' || activeTab === 'notifications' || activeTab === 'payments' || activeTab === 'security') && (
          <button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <nav className="flex flex-col gap-1 sticky top-6">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${activeTab === tab.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Platform Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                  <input type="text" value={settings.platformName} onChange={e => setSettings({...settings, platformName: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                  <input type="email" value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Care Phone</label>
                  <input type="text" value={settings.customerCarePhone} onChange={e => setSettings({...settings, customerCarePhone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Admin Profile</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl overflow-hidden border border-slate-200">
                    {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (profile.name ? profile.name.substring(0,2).toUpperCase() : 'AD')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Avatar URL</label>
                    <input type="text" placeholder="https://example.com/avatar.png" value={profile.avatar} onChange={e => setProfile({...profile, avatar: e.target.value})} className="w-full md:w-96 border border-slate-300 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:border-teal-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Read-only)</label>
                  <input type="email" value={profile.email} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 text-sm" />
                  <p className="text-xs text-slate-500 mt-1">To change your email, use the Login & Password tab.</p>
                </div>
                <button onClick={handleSaveProfile} disabled={loading} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70">
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Login & Password Tab */}
          {activeTab === 'login' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Change Login Email</h3>
                
                {emailChangeStep === 1 ? (
                  <form onSubmit={handleRequestEmailChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Login Email</label>
                      <input type="email" value={profile.email} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">New Login Email</label>
                      <input type="email" required value={loginEmail.newEmail} onChange={e => setLoginEmail({...loginEmail, newEmail: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Login Email</label>
                      <input type="email" required value={loginEmail.confirmEmail} onChange={e => setLoginEmail({...loginEmail, confirmEmail: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Password (Required)</label>
                      <input type="password" required value={loginEmail.currentPassword} onChange={e => setLoginEmail({...loginEmail, currentPassword: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70">
                      {loading ? 'Processing...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm mb-4 border border-blue-100">
                      An OTP has been sent to <strong>{loginEmail.newEmail}</strong>. Please enter it below to verify your new email address.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                      <input type="text" required value={loginEmail.otp} onChange={e => setLoginEmail({...loginEmail, otp: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" placeholder="123456" />
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70">
                        {loading ? 'Verifying...' : 'Verify & Change Email'}
                      </button>
                      <button type="button" onClick={() => setEmailChangeStep(1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                      <button 
                        type="button" 
                        onClick={() => handleRequestEmailChange()} 
                        disabled={resendCooldown > 0 || loading} 
                        className={`text-sm font-medium ml-auto ${resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-teal-600 hover:text-teal-700'}`}
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Change Password</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input type={showPassword.current ? "text" : "password"} required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 pr-10" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, current: !showPassword.current})} className="absolute right-3 top-8 text-slate-400">
                      {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input type={showPassword.new ? "text" : "password"} required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 pr-10" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-8 text-slate-400">
                      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <p className="text-xs text-slate-500 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input type={showPassword.confirm ? "text" : "password"} required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 pr-10" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-8 text-slate-400">
                      {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Two-Factor Authentication (2FA)</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">Enable 2FA</p>
                    <p className="text-xs text-slate-500">Protect your account with an additional layer of security.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.twoFactorEnabled} onChange={e => setSettings({...settings, twoFactorEnabled: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Session Security</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">Active Sessions</p>
                    <p className="text-xs text-slate-500">You are currently logged in on this device.</p>
                  </div>
                  <button className="text-sm text-red-600 font-medium hover:text-red-700">Logout All Other Devices</button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.keys(settings.notifications || {}).map(key => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.notifications[key]} onChange={e => setSettings({...settings, notifications: {...settings.notifications, [key]: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments & Delivery Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Delivery Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">Free Delivery Threshold</p>
                    <p className="text-xs text-slate-500">Orders above this amount qualify for free shipping.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <input type="number" value={settings.freeDeliveryThreshold} onChange={e => setSettings({...settings, freeDeliveryThreshold: Number(e.target.value)})} className="w-24 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">Standard Delivery Fee</p>
                    <p className="text-xs text-slate-500">Fee for orders below the threshold.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <input type="number" value={settings.standardDeliveryFee} onChange={e => setSettings({...settings, standardDeliveryFee: Number(e.target.value)})} className="w-24 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
