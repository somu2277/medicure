import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '../utils/api';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [prescriptionFilter, setPrescriptionFilter] = useState('all'); // 'all', 'rx', 'otc'
  const [sortBy, setSortBy] = useState('Relevance');

  useEffect(() => {
    const fetchMedicinesAndCategories = async () => {
      try {
        setLoading(true);
        const [medRes, catRes] = await Promise.all([
          api.get('/products?type=medicine'), // or fetch all products
          api.get('/categories')
        ]);
        
        // Handle variations in backend response format
        setMedicines(medRes.data.products || medRes.data.medicines || (Array.isArray(medRes.data) ? medRes.data : []));
        setCategories(catRes.data.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicinesAndCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Derived State (Filtered & Sorted Medicines)
  const filteredMedicines = medicines
    .filter(med => {
      // Search
      if (searchQuery && !med.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Categories
      if (selectedCategories.length > 0) {
        // Product might have categoryId object or string
        const catId = med.categoryId?._id || med.categoryId;
        if (!selectedCategories.includes(catId)) return false;
      }
      // Prescription
      if (prescriptionFilter === 'rx' && !med.prescriptionRequired) return false;
      if (prescriptionFilter === 'otc' && med.prescriptionRequired) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'Price: High to Low') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'Discount') return b.discount - a.discount;
      return 0; // Relevance
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Medicines</h1>
        <p className="text-slate-500 text-sm mt-1">Showing {filteredMedicines.length} products</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar / Filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-lg p-4 sticky top-24">
            <div className="flex items-center gap-2 font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
              <Filter size={18} />
              Filters
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-sm mb-3">Categories</h3>
              <ul className="space-y-2 text-sm text-slate-600 max-h-60 overflow-y-auto">
                {categories.map(cat => (
                  <li key={cat._id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryChange(cat._id)}
                        className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer" 
                      /> 
                      {cat.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-sm mb-3">Prescription</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="prescription"
                      checked={prescriptionFilter === 'all'}
                      onChange={() => setPrescriptionFilter('all')}
                      className="text-teal-600 focus:ring-teal-500 cursor-pointer" 
                    /> 
                    All
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="prescription"
                      checked={prescriptionFilter === 'rx'}
                      onChange={() => setPrescriptionFilter('rx')}
                      className="text-teal-600 focus:ring-teal-500 cursor-pointer" 
                    /> 
                    Required (Rx)
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="prescription"
                      checked={prescriptionFilter === 'otc'}
                      onChange={() => setPrescriptionFilter('otc')}
                      className="text-teal-600 focus:ring-teal-500 cursor-pointer" 
                    /> 
                    Over the counter (OTC)
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Top Controls: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-1/2 relative">
              <input
                type="text"
                placeholder="Search medicines by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-300 rounded-full pl-4 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <button className="md:hidden flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 text-sm font-medium">
                <Filter size={16} /> Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>Loading medicines...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg text-center">
              <h3 className="font-bold text-lg mb-2">Oops!</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p>No medicines match your filters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategories([]); setPrescriptionFilter('all'); }}
                className="mt-4 text-teal-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedicines.map((medicine) => (
                <ProductCard key={medicine._id} product={medicine} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicinesPage;
