import React from 'react';
import { Settings, Save, Shield, Bell, CreditCard, Building } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Platform Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage core configuration for the MediCare platform.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-1">
          <nav className="flex flex-col gap-1 sticky top-6">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-lg font-medium text-sm transition-colors">
              <Building size={18} /> General
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
              <Shield size={18} /> Security
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
              <Bell size={18} /> Notifications
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
              <CreditCard size={18} /> Payments
            </a>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Platform Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                <input type="text" defaultValue="MediCare" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                <input type="email" defaultValue="support@medicare.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Care Phone</label>
                <input type="text" defaultValue="+91 1800-419-1111" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500" />
              </div>
            </div>
          </div>

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
                  <input type="number" defaultValue="499" className="w-24 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-medium text-slate-800 text-sm">Standard Delivery Fee</p>
                  <p className="text-xs text-slate-500">Fee for orders below the threshold.</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input type="number" defaultValue="49" className="w-24 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
