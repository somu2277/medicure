import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronRight, MapPin, Truck, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('orders'); // orders, appointments, lab
  const [data, setData] = useState({
    orders: [],
    appointments: [],
    labBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all user data in parallel
        const [ordersRes, apptRes, labRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: { orders: [] } })),
          api.get('/appointments/my-appointments').catch(() => ({ data: [] })),
          api.get('/lab-bookings').catch(() => ({ data: { bookings: [] } }))
        ]);
        
        setData({
          orders: ordersRes.data.orders || ordersRes.data || [],
          appointments: apptRes.data.appointments || (Array.isArray(apptRes.data) ? apptRes.data : []),
          labBookings: labRes.data.bookings || labRes.data || []
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'text-slate-600 bg-slate-100 border-slate-200';
    const s = status.toUpperCase();
    if (s.includes('DELIVERED') || s.includes('COMPLETED') || s.includes('CONFIRMED') || s.includes('APPROVED')) return 'text-success bg-success/10 border-success/20';
    if (s.includes('OUT') || s.includes('READY')) return 'text-primary bg-primary/10 border-primary/20';
    if (s.includes('CANCELLED') || s.includes('FAILED') || s.includes('REJECTED')) return 'text-error bg-error/10 border-error/20';
    return 'text-blue-600 bg-blue-50 border-blue-100'; // processing/pending
  };

  const getStatusIcon = (status) => {
    if (!status) return <Clock size={16} />;
    const s = status.toUpperCase();
    if (s.includes('DELIVERED') || s.includes('COMPLETED') || s.includes('APPROVED')) return <CheckCircle size={16} />;
    if (s.includes('OUT')) return <Truck size={16} />;
    return <Clock size={16} />;
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading your health profile...</div>;
  
  if (error) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-error mb-4">{error}</div>
      <button onClick={() => window.location.reload()} className="text-primary hover:underline font-medium">Try Again</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Health Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Package size={18} /> Medicine Orders
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Calendar size={18} /> Doctor Appointments
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`px-4 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'lab' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Activity size={18} /> Lab Bookings
          </button>
        </div>
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          data.orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">No orders found</h2>
              <p className="text-slate-500 mb-6">You haven't placed any medicine orders yet.</p>
              <Link to="/medicines" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg transition-colors hover:bg-primary/90">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">ORDER ID</span>
                      <p className="text-sm font-bold text-slate-800">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">PLACED ON</span>
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">TOTAL</span>
                      <p className="text-sm font-bold text-slate-800">,1{order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus || 'PENDING')}`}>
                        {getStatusIcon(order.orderStatus || 'PENDING')}
                        {(order.orderStatus || 'PENDING').replace(/_/g, ' ')}
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-10 h-10 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center">
                              <Package size={20} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center justify-end w-full md:w-auto">
                      <Link to={`/order/${order._id}`} className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold py-2 px-6 rounded-lg transition-colors border border-teal-200">
                        View Order
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          data.appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">No appointments</h2>
              <p className="text-slate-500 mb-6">You haven't booked any doctor consultations.</p>
              <Link to="/doctors" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg transition-colors hover:bg-primary/90">
                Find a Doctor
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.appointments.map(appt => (
                <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">Dr. {appt.doctorId?.userId?.name || 'Doctor'}</h3>
                    <p className="text-sm text-slate-500 mb-4">{appt.doctorId?.specialization || 'Consultation'}</p>
                    
                    {appt.confirmedDate ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-3">
                            <span className="text-xs text-emerald-700 font-bold block mb-1">CONFIRMED SCHEDULE</span>
                            <div className="flex gap-4 text-sm text-emerald-800">
                              <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(appt.confirmedDate).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock size={14}/> {appt.confirmedStartTime}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-3">
                            <span className="text-xs text-slate-500 font-bold block mb-1">REQUESTED PREFERENCES</span>
                            <div className="flex gap-4 text-sm text-slate-700">
                              <span className="flex items-center gap-1"><Calendar size={14}/> {appt.preferredDate ? new Date(appt.preferredDate).toLocaleDateString() : 'Any Date'}</span>
                              <span className="flex items-center gap-1"><Clock size={14}/> {appt.preferredTimeOfDay || 'Any Time'}</span>
                            </div>
                            <p className="text-xs text-amber-600 mt-2 font-medium">Your appointment is awaiting scheduling. Our team will contact you after checking the doctor's availability.</p>
                        </div>
                    )}
                    
                    {appt.schedulingNotes && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-2 border border-blue-100"><strong>Note from Admin:</strong> {appt.schedulingNotes}</p>
                    )}

                    {appt.meetingLink && appt.status.includes('Approved') && (
                        <a href={`https://${appt.meetingLink}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            Join Video Call
                        </a>
                    )}
                    {appt.rejectionReason && appt.status === 'Rejected' && (
                        <p className="text-sm text-red-600 mt-3 bg-red-50 p-2 rounded border border-red-100"><strong>Reason for Rejection:</strong> {appt.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between min-w-[120px]">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                      {getStatusIcon(appt.status)}
                      {appt.status}
                    </div>
                    <span className="text-sm font-bold text-slate-800 mt-4">₹{appt.feeSnapshot}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Lab Bookings Tab */}
        {activeTab === 'lab' && (
          data.labBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">No lab bookings</h2>
              <p className="text-slate-500 mb-6">You haven't booked any lab tests yet.</p>
              <Link to="/lab-tests" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg transition-colors hover:bg-primary/90">
                Book a Test
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.labBookings.map(lab => (
                <div key={lab._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{lab.testId?.name || 'Diagnostic Test'}</h3>
                    <p className="text-sm text-slate-500 mb-2">Patient: {lab.patientDetails?.name}</p>
                    <div className="flex gap-4 text-sm text-slate-700">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Calendar size={14}/> {new Date(lab.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={14}/> {lab.timeSlot}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(lab.status)}`}>
                      {getStatusIcon(lab.status)}
                      {lab.status}
                    </div>
                    <span className="text-sm font-bold text-slate-800 mt-4">,1{lab.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default OrdersPage;
