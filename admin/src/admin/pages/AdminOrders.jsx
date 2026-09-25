import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, X, Package, User, Truck, Clock, FileText, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const ORDER_STATUSES = [
  'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PRESCRIPTION_VERIFICATION', 
  'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 
  'DELIVERED', 'CANCELLED', 'DELIVERY_FAILED', 'RETURNED', 'REFUNDED'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [shipment, setShipment] = useState({ courierName: '', trackingNumber: '', estimatedDeliveryDate: '' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      if (data.success || data.orders) {
        setOrders(data.orders || data.data || (Array.isArray(data) ? data : []));
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Socket.io real-time updates
    import('../../utils/socket').then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      
      const handleRealtimeUpdate = () => {
        fetchOrders();
      };

      socket.on('order:created', handleRealtimeUpdate);
      socket.on('order:statusChanged', handleRealtimeUpdate);

      return () => {
        socket.off('order:created', handleRealtimeUpdate);
        socket.off('order:statusChanged', handleRealtimeUpdate);
      };
    }).catch(err => console.log('Socket import skipped', err));
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const payload = { 
        orderStatus: newStatus,
        paymentStatus: newPaymentStatus,
        shipment: (newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') ? shipment : undefined 
      };
      
      // Clean up empty shipment fields if needed
      if (payload.shipment) {
        if (!payload.shipment.courierName) delete payload.shipment.courierName;
        if (!payload.shipment.trackingNumber) delete payload.shipment.trackingNumber;
        if (!payload.shipment.estimatedDeliveryDate) delete payload.shipment.estimatedDeliveryDate;
      }

      const { data } = await api.patch(`/orders/${selectedOrder._id}/status`, payload);
      
      // Update local state
      setOrders(orders.map(o => o._id === selectedOrder._id ? { 
        ...o, 
        orderStatus: newStatus, 
        paymentStatus: newPaymentStatus,
        shipment: { ...o.shipment, ...shipment } 
      } : o));
      setSelectedOrder({ 
        ...selectedOrder, 
        orderStatus: newStatus, 
        paymentStatus: newPaymentStatus,
        shipment: { ...selectedOrder.shipment, ...shipment } 
      });
      alert(data.message || 'Status updated successfully');
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update order status');
    }
  };

  const openModal = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order._id}`);
      const fullOrder = data.order || order;
      setSelectedOrder(fullOrder);
      setNewStatus(fullOrder.orderStatus || 'PENDING_PAYMENT');
      setNewPaymentStatus(fullOrder.paymentStatus || 'PENDING');
      setShipment({
        courierName: fullOrder.shipment?.courierName || '',
        trackingNumber: fullOrder.shipment?.trackingNumber || '',
        estimatedDeliveryDate: fullOrder.shipment?.estimatedDeliveryDate ? new Date(fullOrder.shipment.estimatedDeliveryDate).toISOString().split('T')[0] : ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching full order details', err);
      setSelectedOrder(order);
      setNewStatus(order.orderStatus || 'PENDING_PAYMENT');
      setNewPaymentStatus(order.paymentStatus || 'PENDING');
      setShipment({
        courierName: order.shipment?.courierName || '',
        trackingNumber: order.shipment?.trackingNumber || '',
        estimatedDeliveryDate: order.shipment?.estimatedDeliveryDate ? new Date(order.shipment.estimatedDeliveryDate).toISOString().split('T')[0] : ''
      });
      setIsModalOpen(true);
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => !['DELIVERED', 'CANCELLED', 'DELIVERY_FAILED', 'RETURNED', 'REFUNDED'].includes(o.orderStatus)).length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;

  const getStatusColor = (status) => {
    if (['DELIVERED'].includes(status)) return 'bg-emerald-100 text-emerald-700';
    if (['CANCELLED', 'DELIVERY_FAILED', 'RETURNED', 'REFUNDED'].includes(status)) return 'bg-rose-100 text-rose-700';
    if (['SHIPPED', 'OUT_FOR_DELIVERY'].includes(status)) return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalOrders}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingOrders}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Delivered</p>
            <h3 className="text-2xl font-bold text-slate-800">{deliveredOrders}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      #{order.orderId || (order._id && order._id.slice(-8).toUpperCase()) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{order.userId?.name || 'Guest'}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ₹{order.total || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(order.orderStatus)}`}>
                        {(order.orderStatus || 'PENDING').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(order)}
                        className="flex items-center gap-1.5 ml-auto text-sm text-teal-600 hover:text-teal-700 font-medium py-1 px-2 rounded hover:bg-teal-50 transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Order Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} className="text-slate-400" /> Customer Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Name</span>
                      <span className="font-medium text-slate-800">{selectedOrder.userId?.name || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-800">{selectedOrder.userId?.email || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium text-slate-800">{selectedOrder.userId?.phone || 'N/A'}</span>
                    </p>
                    <div className="pt-2">
                      <span className="text-slate-500 block mb-1">Shipping Address</span>
                      <p className="font-medium text-slate-800 leading-relaxed">
                        {selectedOrder.address ? (
                          <>
                            {selectedOrder.address.addressLine}<br/>
                            {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}
                          </>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" /> Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Order ID</span>
                      <span className="font-bold text-slate-800">#{selectedOrder.orderId || (selectedOrder._id && selectedOrder._id.slice(-8).toUpperCase())}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium text-slate-800">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Payment Status</span>
                      <span className="font-medium text-slate-800">{selectedOrder.paymentStatus}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Total Amount</span>
                      <span className="font-bold text-teal-600 text-lg">₹{selectedOrder.total}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Package size={16} className="text-slate-400" /> Products
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Item</th>
                        <th className="px-4 py-3 font-medium text-center">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Price</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{item.name}</p>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">₹{item.price}</td>
                          <td className="px-4 py-3 text-right font-medium">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prescription Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" /> Prescription & Pharmacy Verification
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  {selectedOrder.prescriptionId ? (
                    <div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div>
                          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Prescription Status</span>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            selectedOrder.prescriptionId.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            selectedOrder.prescriptionId.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {selectedOrder.prescriptionId.status}
                          </span>
                        </div>
                        <a href={`http://localhost:5000${selectedOrder.prescriptionId.fileUrl}`} target="_blank" rel="noreferrer" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-1.5 px-4 rounded transition-colors flex items-center gap-2">
                          <Eye size={14} /> View Prescription
                        </a>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <span className="text-slate-500 block mb-1">Actions</span>
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              try {
                                await api.patch(`/prescriptions/${selectedOrder.prescriptionId._id}/status`, { status: 'APPROVED' });
                                openModal(selectedOrder);
                              } catch (err) { alert('Failed to approve'); }
                            }} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold">Approve</button>
                            <button onClick={async () => {
                              const reason = window.prompt('Rejection reason:');
                              if (reason) {
                                try {
                                  await api.patch(`/prescriptions/${selectedOrder.prescriptionId._id}/status`, { status: 'REJECTED', reviewNotes: reason });
                                  openModal(selectedOrder);
                                } catch (err) { alert('Failed to reject'); }
                              }
                            }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold">Reject</button>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Review Notes</span>
                          <p className="font-medium text-slate-800">{selectedOrder.prescriptionId.reviewNotes || 'None'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No prescription uploaded for this order.</p>
                  )}
                </div>
              </div>

              {/* Update Status Section */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-slate-400" /> Fulfilment & Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Order Status</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Payment Status</label>
                    <select 
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Courier Name</label>
                    <input 
                      type="text"
                      value={shipment.courierName}
                      onChange={(e) => setShipment({...shipment, courierName: e.target.value})}
                      placeholder="e.g. BlueDart, Delhivery"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Tracking Number</label>
                    <input 
                      type="text"
                      value={shipment.trackingNumber}
                      onChange={(e) => setShipment({...shipment, trackingNumber: e.target.value})}
                      placeholder="e.g. TRK123456789"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Est. Delivery Date</label>
                    <input 
                      type="date"
                      value={shipment.estimatedDeliveryDate}
                      onChange={(e) => setShipment({...shipment, estimatedDeliveryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
                  <button 
                    onClick={handleUpdateStatus}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
