import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    // Socket.io real-time updates
    import('../../utils/socket').then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      
      const handleRealtimeUpdate = () => {
        fetchProducts();
      };

      socket.on('product:updated', handleRealtimeUpdate);
      socket.on('product:created', handleRealtimeUpdate);
      socket.on('product:archived', handleRealtimeUpdate);

      return () => {
        socket.off('product:updated', handleRealtimeUpdate);
        socket.off('product:created', handleRealtimeUpdate);
        socket.off('product:archived', handleRealtimeUpdate);
      };
    });
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || data.medicines || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
        <Link 
          to="/admin/products/add-medicine" 
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Medicine
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price (MRP)</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No products found. Add your first medicine.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-slate-200 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="text-slate-300 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand || 'No Brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{product.categoryId?.name || product.category || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-semibold">₹{product.sellingPrice}</p>
                      {product.mrp > product.sellingPrice && <p className="text-xs text-slate-400 line-through">₹{product.mrp}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {product.stockQuantity ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">Active</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
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
    </div>
  );
};

export default AdminProducts;
