import React from 'react';
import { Activity, Plus, Search } from 'lucide-react';

const AdminLabTests = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search lab tests..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Add Lab Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500">
        <Activity size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Lab Tests Module</h2>
        <p className="text-sm max-w-md text-center">
          The Lab Tests module is currently in development. You will soon be able to manage diagnostic packages, home collection slots, and partner labs from this dashboard.
        </p>
      </div>
    </div>
  );
};

export default AdminLabTests;
