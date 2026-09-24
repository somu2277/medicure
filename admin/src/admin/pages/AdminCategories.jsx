import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">No categories found.</div>
        ) : (
          categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-800">{cat.name}</h3>
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-teal-600"><Edit2 size={16}/></button>
                  <button className="text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded mb-4">Slug: {cat.slug}</p>
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subcategories ({cat.subCategories?.length || 0})</h4>
                <div className="flex flex-wrap gap-2">
                  {cat.subCategories?.map(sub => (
                    <span key={sub._id} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 font-medium">
                      {sub.name}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-teal-50 text-teal-600 border border-teal-200 rounded text-xs font-bold hover:bg-teal-100 transition-colors">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
