import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../utils/api';
import socket from '../../utils/socket';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/products');
      setInventory(data.products || data.medicines || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    if (!socket.connected) socket.connect();
    
    const handleUpdate = () => fetchInventory();
    
    socket.on('product:updated', handleUpdate);
    socket.on('product:created', handleUpdate);
    socket.on('order:created', handleUpdate); // Stock decreases on order

    return () => {
      socket.off('product:updated', handleUpdate);
      socket.off('product:created', handleUpdate);
      socket.off('order:created', handleUpdate);
    };
  }, []);

  const updateStock = async (id, newStock) => {
    try {
      await api.patch(`/products/${id}`, { stockQuantity: newStock });
      fetchInventory(); // socket will also trigger this, but optimistic is good
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search SKUs or products..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">SKU / Product</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium">Current Stock</th>
                <th className="px-6 py-4 font-medium">Quick Update</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No products found.</td></tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku || item.productId}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.stockQuantity <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-lg">
                      {item.stockQuantity ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateStock(item._id, (item.stockQuantity || 0) - 1)}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={item.stockQuantity ?? 0}
                          onChange={(e) => updateStock(item._id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center py-1 border border-slate-200 rounded text-sm font-semibold focus:outline-none focus:border-teal-500"
                        />
                        <button 
                          onClick={() => updateStock(item._id, (item.stockQuantity || 0) + 1)}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          +
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

export default AdminInventory;
