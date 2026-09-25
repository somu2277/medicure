import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  
  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [subFormData, setSubFormData] = useState({ name: '', slug: '' });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditData(cat);
      setFormData({ name: cat.name, slug: cat.slug });
    } else {
      setEditData(null);
      setFormData({ name: '', slug: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    setFormData({ name: '', slug: '' });
  };

  const openSubModal = (categoryId) => {
    setActiveCategoryId(categoryId);
    setSubFormData({ name: '', slug: '' });
    setIsSubModalOpen(true);
  };

  const closeSubModal = () => {
    setIsSubModalOpen(false);
    setActiveCategoryId(null);
    setSubFormData({ name: '', slug: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/categories/${editData._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
      console.error(err);
    }
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/categories/${activeCategoryId}/subcategories`, subFormData);
      closeSubModal();
      fetchCategories();
    } catch (err) {
      alert('Failed to save subcategory');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All its subcategories will be lost.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">No categories found.</div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-800">{cat.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal(cat)} className="text-slate-400 hover:text-teal-600"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(cat._id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
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
                  <button 
                    onClick={() => openSubModal(cat._id)}
                    className="px-2 py-1 bg-teal-50 text-teal-600 border border-teal-200 rounded text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editData ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                  placeholder="e.g. Health Must Haves"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (optional)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                  placeholder="e.g. health-must-haves"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                  {editData ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Subcategory</h2>
              <button onClick={closeSubModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({...subFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                  placeholder="e.g. Daily Wellness"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (optional)</label>
                <input 
                  type="text" 
                  value={subFormData.slug}
                  onChange={(e) => setSubFormData({...subFormData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                  placeholder="e.g. daily-wellness"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeSubModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
