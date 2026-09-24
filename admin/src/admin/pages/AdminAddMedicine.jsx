import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';

const AdminAddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reference lists from DB
  const [categories, setCategories] = useState([]);
  const [healthConcerns, setHealthConcerns] = useState([]);
  const [availableSubcats, setAvailableSubcats] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    manufacturer: '',
    categoryId: '',
    subcategoryId: '',
    healthConcernIds: [],
    productType: 'Medicine',
    description: '',
    packSize: '',
    mrp: '',
    sellingPrice: '',
    stockQuantity: '',
    image: '',
    prescriptionRequired: false
  });

  useEffect(() => {
    // Fetch categories and health concerns on mount
    const fetchRefs = async () => {
      try {
        const [catRes, hcRes] = await Promise.all([
          api.get('/categories'),
          api.get('/health-concerns')
        ]);
        setCategories(catRes.data.categories || []);
        setHealthConcerns(hcRes.data.healthConcerns || []);
      } catch (err) {
        console.error("Failed to load reference data", err);
      }
    };
    fetchRefs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Multi-select for health concerns
    if (name === 'healthConcernIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, healthConcernIds: selectedOptions }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If category changes, update available subcategories
    if (name === 'categoryId') {
      const selectedCat = categories.find(c => c._id === value);
      if (selectedCat && selectedCat.subCategories) {
        setAvailableSubcats(selectedCat.subCategories);
      } else {
        setAvailableSubcats([]);
      }
      setFormData(prev => ({ ...prev, subcategoryId: '' })); // reset subcat
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const payload = { ...formData };
      payload.mrp = parseFloat(payload.mrp);
      payload.sellingPrice = parseFloat(payload.sellingPrice);
      payload.stockQuantity = parseInt(payload.stockQuantity);

      await api.post('/products', payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
          <p className="text-sm text-slate-500">Create a new product listing in the catalog</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          Product added successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="e.g. Dolo 650 Tablet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
              <input 
                type="text" name="brand" required
                value={formData.brand} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="e.g. Micro Labs Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select 
                name="categoryId" required
                value={formData.categoryId} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
              <select 
                name="subcategoryId"
                value={formData.subcategoryId} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">Select Subcategory</option>
                {availableSubcats.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input 
                type="url" name="image" 
                value={formData.image} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Type</label>
              <select 
                name="productType" required
                value={formData.productType} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Medicine">Medicine</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Device">Device</option>
                <option value="Supplement">Supplement</option>
              </select>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              name="description" rows="4"
              value={formData.description} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Enter product details, composition, and uses..."
            ></textarea>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MRP (₹) *</label>
              <input 
                type="number" name="mrp" required min="0" step="0.01"
                value={formData.mrp} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹) *</label>
              <input 
                type="number" name="sellingPrice" required min="0" step="0.01"
                value={formData.sellingPrice} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
              <input 
                type="number" name="stockQuantity" required min="0"
                value={formData.stockQuantity} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pack Size</label>
              <input 
                type="text" name="packSize"
                value={formData.packSize} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="e.g. 10 Tablets"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Health Concerns (Hold Ctrl/Cmd to select multiple)</label>
            <select 
              name="healthConcernIds" multiple
              value={formData.healthConcernIds} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 h-24"
            >
              {healthConcerns.map(hc => (
                <option key={hc._id} value={hc._id}>{hc.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" id="prescriptionRequired" name="prescriptionRequired"
              checked={formData.prescriptionRequired} onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="prescriptionRequired" className="text-sm font-medium text-slate-700">
              Prescription Required for this medicine
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Medicine
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddMedicine;
