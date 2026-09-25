import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronRight, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Could not load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'text-success bg-success/10 border-success/20';
      case 'OUT_FOR_DELIVERY': return 'text-primary bg-primary/10 border-primary/20';
      case 'PROCESSING': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'CANCELLED': return 'text-error bg-error/10 border-error/20';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'DELIVERED': return <CheckCircle size={16} />;
      case 'OUT_FOR_DELIVERY': return <Truck size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading your orders...</div>;
  
  if (error) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-error mb-4">{error}</div>
      <button onClick={() => window.location.reload()} className="text-primary hover:underline font-medium">Try Again</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No orders found</h2>
            <p className="text-slate-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/medicines" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg transition-colors hover:bg-primary/90">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">ORDER ID</span>
                    <p className="text-sm font-bold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">PLACED ON</span>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">TOTAL AMOUNT</span>
                    <p className="text-sm font-bold text-slate-800">,1{order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
                  {/* Items List */}
                  <div className="flex-1 space-y-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus || 'PENDING')}`}>
                      {getStatusIcon(order.orderStatus || 'PENDING')}
                      {(order.orderStatus || 'PENDING').replace(/_/g, ' ')}
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200 flex-shrink-0"></div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Delivery Address */}
                  <div className="md:w-1/3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                      <MapPin size={14} /> DELIVERY ADDRESS
                    </h3>
                    <div className="text-sm text-slate-700">
                      {order.address ? (
                        <>
                          <p className="font-semibold text-slate-800">{order.address.addressLine}</p>
                          <p>{order.address.city}, {order.address.state}</p>
                          <p className="font-medium mt-1">PIN: {order.address.pincode}</p>
                        </>
                      ) : (
                        <p className="text-slate-500 italic">No address provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
