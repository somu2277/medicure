import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Activity } from 'lucide-react';
import api from '../../utils/api';

const AdminLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    testPreparation: '',
    sampleType: '',
    reportTime: '',
    isPopular: false,
    category: 'Test',
    testsIncluded: '' // We'll handle this as comma-separated string for simplicity
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/lab-tests');
      setLabTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load lab tests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  const openModal = (test = null) => {
    if (test) {
      setEditData(test);
      setFormData({
        ...test,
        testsIncluded: test.testsIncluded ? test.testsIncluded.join(', ') : ''
      });
    } else {
      setEditData(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        testsIncluded: formData.testsIncluded ? formData.testsIncluded.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      
      if (editData) {
        await api.put(`/lab-tests/${editData._id}`, payload);
      } else {
        await api.post('/lab-tests', payload);
      }
      closeModal();
      fetchLabTests();
    } catch (err) {
      alert('Failed to save lab test');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab test?')) return;
    try {
      await api.delete(`/lab-tests/${id}`);
      fetchLabTests();
    } catch (err) {
      alert('Failed to delete lab test');
    }
  };

  const filteredTests = labTests.filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search lab tests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Lab Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Test Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Sample Type</th>
                <th className="px-6 py-4 font-medium">Report Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading lab tests...</td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 flex flex-col items-center justify-center text-slate-500">
                    <Activity size={48} className="text-slate-300 mb-4" />
                    <p>No lab tests found. Create one to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{test.name}</p>
                        {test.isPopular && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Popular</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${test.category === 'Package' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {test.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{test.price}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {test.sampleType || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {test.reportTime || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(test)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(test._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editData ? 'Edit Lab Test' : 'Add Lab Test'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                    <option value="Test">Test</option>
                    <option value="Package">Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sample Type</label>
                  <input type="text" placeholder="e.g. Blood, Urine" value={formData.sampleType} onChange={(e) => setFormData({...formData, sampleType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Report Time</label>
                  <input type="text" placeholder="e.g. 24 Hours" value={formData.reportTime} onChange={(e) => setFormData({...formData, reportTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tests Included (Comma separated for Packages)</label>
                  <input type="text" placeholder="e.g. Complete Blood Count, Fasting Blood Sugar" value={formData.testsIncluded} onChange={(e) => setFormData({...formData, testsIncluded: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Preparation</label>
                  <input type="text" placeholder="e.g. 10-12 hours fasting required" value={formData.testPreparation} onChange={(e) => setFormData({...formData, testPreparation: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isPopular" checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} className="rounded text-teal-600 focus:ring-teal-500" />
                  <label htmlFor="isPopular" className="text-sm font-medium text-slate-700">Mark as Popular Package/Test</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                  {editData ? 'Save Changes' : 'Create Lab Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLabTests;
