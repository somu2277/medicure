import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '../utils/api';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/medicines');
        // The backend returns { count, medicines: [...] } based on standard patterns, 
        // or just the array. Let's handle both.
        setMedicines(data.medicines || data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError(err.response?.data?.message || 'Failed to fetch medicines. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Medicines</h1>
        <p className="text-slate-500 text-sm mt-1">Showing {medicines.length} products</p>
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
              <ul className="space-y-2 text-sm text-slate-600">
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Pain Relief</label></li>
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Antibiotics</label></li>
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Vitamins</label></li>
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Diabetes</label></li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-sm mb-3">Prescription</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Required (Rx)</label></li>
                <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary" /> Over the counter</label></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Mobile Filter Button & Sort */}
          <div className="flex items-center justify-between mb-4 md:justify-end">
            <button className="md:hidden flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 text-sm font-medium">
              <Filter size={16} /> Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
              <select className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Discount</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>Loading medicines...</p>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/30 text-error p-6 rounded-lg text-center">
              <h3 className="font-bold text-lg mb-2">Oops!</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-error text-white px-4 py-2 rounded hover:bg-error/90"
              >
                Try Again
              </button>
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p>No medicines found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {medicines.map((medicine) => (
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
