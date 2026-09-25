import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CANCELLED':
    case 'DELIVERY_FAILED': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-orange-100 text-orange-700 border-orange-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'DELIVERED': return <Package size={14} />;
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return <Truck size={14} />;
    default: return <Clock size={14} />;
  }
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders');
        setOrders(data.orders || data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Unable to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-500 mt-2">Track and manage your medicine orders.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 text-center">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No orders found</h2>
            <p className="text-slate-500 mb-6 text-lg">You haven't placed any medicine orders yet.</p>
            <Link to="/medicines" className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg transition-colors hover:bg-teal-700 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap gap-x-12 gap-y-4">
                    <div>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Order ID</span>
                      <p className="text-sm font-bold text-slate-800">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Placed On</span>
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Amount</span>
                      <p className="text-sm font-bold text-slate-800">₹{order.total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Payment</span>
                      <p className={`text-sm font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.paymentStatus || 'PENDING'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link to={`/order/${order._id}`} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                      View Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1 w-full">
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus || 'PENDING')}`}>
                        {getStatusIcon(order.orderStatus || 'PENDING')}
                        {(order.orderStatus || 'PENDING').replace(/_/g, ' ')}
                      </div>
                    </div>
                    
                    <div className="space-y-4 divide-y divide-slate-50">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="pt-4 first:pt-0 flex gap-4 items-start">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                            <Package size={24} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Details</h3>
                    <p className="text-sm font-semibold text-slate-800">{order.address?.addressLine}</p>
                    <p className="text-sm text-slate-600">{order.address?.city}, {order.address?.state}</p>
                    <p className="text-sm text-slate-600">PIN: {order.address?.pincode}</p>
                    
                    {order.shipment?.trackingNumber && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking</h3>
                        <p className="text-sm font-semibold text-slate-800">{order.shipment.courierName || 'Courier'}</p>
                        <p className="text-sm text-teal-600 font-bold">{order.shipment.trackingNumber}</p>
                        <Link to={`/order/${order._id}`} className="text-xs text-slate-500 hover:text-teal-600 mt-1 inline-block underline">Track Order</Link>
                      </div>
                    )}
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

export default MyOrdersPage;
