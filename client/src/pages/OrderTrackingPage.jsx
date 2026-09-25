import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, MapPin, FileText, ChevronLeft, Calendar } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Socket.io for real-time order updates
    // Assuming socket is configured in a context or similar, 
    // we would listen for 'order:statusChanged' here.
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !order) return <div className="text-center py-20 text-red-500">{error || 'Order not found'}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/dashboard" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium mb-6">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order #{order.orderId || order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Calendar size={16} />
            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <FileText size={18} /> Invoice
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Timeline & Products */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Truck size={20} className="text-teal-600" /> Live Tracking
            </h2>
            
            <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(order.statusHistory && order.statusHistory.length > 0 ? order.statusHistory : [{status: order.orderStatus, timestamp: order.createdAt}]).map((history, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full border-4 border-white bg-teal-500 shadow-sm flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{history.status.replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(history.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {history.notes && <p className="text-sm text-slate-600 mt-1">{history.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {order.shipment?.trackingNumber && (
              <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100 flex items-start gap-3">
                <Truck size={20} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Courier: {order.shipment.courierName || 'Standard Delivery'}</p>
                  <p className="text-sm text-slate-600">Tracking Number: <span className="font-bold">{order.shipment.trackingNumber}</span></p>
                  {order.shipment.estimatedDeliveryDate && (
                    <p className="text-sm text-teal-700 mt-1 font-medium">Est. Delivery: {new Date(order.shipment.estimatedDeliveryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-teal-600" /> Items in this Order
            </h2>
            <div className="space-y-4 divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Info & Delivery */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || order.total?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toFixed(2)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800 text-base">
                <span>Total</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {order.paymentStatus || 'PENDING'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-teal-600" /> Delivery Address
            </h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">{order.userId?.name}</p>
              <p>{order.address?.addressLine}</p>
              <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              <p className="mt-2 text-slate-500">Phone: {order.userId?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
