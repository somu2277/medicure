import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, FileText, Activity, CreditCard, ExternalLink, Calendar, MessageSquare, Mail, Phone } from 'lucide-react';
import api from '../../utils/api';
import socket from '../../utils/socket';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Scheduling state
  const [scheduleData, setScheduleData] = useState({
    confirmedDate: '',
    confirmedStartTime: '',
    duration: 30,
    schedulingNotes: ''
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    // Listen for socket events
    const handleUpdate = () => fetchAppointments();
    socket.on('appointment:created', handleUpdate);
    socket.on('appointment:statusChanged', handleUpdate);
    
    return () => {
      socket.off('appointment:created', handleUpdate);
      socket.off('appointment:statusChanged', handleUpdate);
    };
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if (status === 'Rejected' && !rejectionReason) {
        return alert("Please provide a rejection reason.");
    }
    
    try {
      const payload = { status, rejectionReason };
      
      // If approving, attach schedule data
      if (status === 'Approved / Confirmed') {
          if (!scheduleData.confirmedDate || !scheduleData.confirmedStartTime) {
              return alert('Please select a confirmed date and time before approving.');
          }
          payload.confirmedDate = scheduleData.confirmedDate;
          payload.confirmedStartTime = scheduleData.confirmedStartTime;
          payload.duration = scheduleData.duration;
          payload.schedulingNotes = scheduleData.schedulingNotes;
      }
      
      await api.put(`/appointments/${id}/status`, payload);
      fetchAppointments();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openDetails = (appt) => {
    setSelectedAppt(appt);
    setRejectionReason('');
    setScheduleData({
        confirmedDate: appt.confirmedDate ? new Date(appt.confirmedDate).toISOString().split('T')[0] : (appt.preferredDate ? new Date(appt.preferredDate).toISOString().split('T')[0] : ''),
        confirmedStartTime: appt.confirmedStartTime || '',
        duration: appt.duration || 30,
        schedulingNotes: appt.schedulingNotes || ''
    });
    setIsModalOpen(true);
  };

  const filtered = appointments.filter(a => {
    const term = searchTerm.toLowerCase();
    const docMatch = a.doctorId?.userId?.name?.toLowerCase().includes(term);
    const patMatch = a.patientName?.toLowerCase().includes(term);
    const idMatch = a._id.toLowerCase().includes(term);
    const statusMatch = filterStatus === 'All' || a.status === filterStatus;
    return (docMatch || patMatch || idMatch) && statusMatch;
  });

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600';
    const s = status.toUpperCase();
    if (s.includes('APPROVED') || s.includes('COMPLETED') || s.includes('CONFIRMED')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('REJECTED') || s.includes('CANCELLED')) return 'bg-rose-100 text-rose-700';
    if (s.includes('PENDING') || s.includes('AWAITING') || s.includes('SUBMITTED') || s.includes('PROPOSED')) return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Doctor Appointments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage appointment requests and schedule slots.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Doctor, Patient, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500"
        >
          <option value="All">All Statuses</option>
          <option value="Request Submitted">Request Submitted</option>
          <option value="Paid - Awaiting Admin Review">Paid - Awaiting Admin Review</option>
          <option value="Awaiting Doctor Availability">Awaiting Doctor Availability</option>
          <option value="Approved / Confirmed">Approved / Confirmed</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Appointment ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Preferred Schedule</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">Loading appointments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">No appointments found matching your filters.</td>
                </tr>
              ) : (
                filtered.map(appt => (
                  <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {appt._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{appt.patientName}</div>
                      <div className="text-xs text-slate-500">{appt.patientContact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">Dr. {appt.doctorId?.userId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{appt.doctorId?.specialization}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium">{appt.preferredDate ? new Date(appt.preferredDate).toLocaleDateString() : 'Any Date'}</div>
                      <div className="text-xs">{appt.preferredTimeOfDay || 'Any Time'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        {appt.consultationType === 'Video' ? <Activity size={14} className="text-blue-500" /> : <Clock size={14} className="text-amber-500" />}
                        {appt.consultationType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${appt.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {appt.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openDetails(appt)}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm inline-flex items-center gap-1"
                      >
                        Schedule & Details <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Scheduling Modal */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">Appointment #{selectedAppt._id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Customer Details</h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                            <p className="mb-1"><span className="text-slate-500 w-24 inline-block">Name:</span> <strong>{selectedAppt.patientName}</strong></p>
                            <p className="mb-1"><span className="text-slate-500 w-24 inline-block">Email:</span> {selectedAppt.patientEmail}</p>
                            <p className="mb-1"><span className="text-slate-500 w-24 inline-block">Phone:</span> {selectedAppt.patientContact}</p>
                            <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                                <a href={`tel:${selectedAppt.patientContact}`} className="flex-1 text-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1">
                                    <Phone size={14} /> Call
                                </a>
                                <a href={`mailto:${selectedAppt.patientEmail}?subject=MediCare Appointment`} className="flex-1 text-center bg-blue-100 hover:bg-blue-200 text-blue-700 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1">
                                    <Mail size={14} /> Email
                                </a>
                                <a href={`https://wa.me/${selectedAppt.patientContact.replace(/\D/g,'')}?text=Hello%20${selectedAppt.patientName},%20regarding%20your%20MediCare%20appointment...`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-100 hover:bg-green-200 text-green-700 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1">
                                    <MessageSquare size={14} /> WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Request Info</h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Doctor:</span> Dr. {selectedAppt.doctorId?.userId?.name}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Pref. Date:</span> {selectedAppt.preferredDate ? new Date(selectedAppt.preferredDate).toDateString() : 'Any Date'}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Pref. Time:</span> {selectedAppt.preferredTimeOfDay || 'Any Time'}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Alt. Date:</span> {selectedAppt.alternativeDate ? new Date(selectedAppt.alternativeDate).toDateString() : 'None'}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Type:</span> {selectedAppt.consultationType}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Status:</span> <strong className={getStatusColor(selectedAppt.status)}>{selectedAppt.status}</strong></p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Fee Snapshot:</span> ₹{selectedAppt.feeSnapshot}</p>
                            <p className="mb-1"><span className="text-slate-500 w-32 inline-block">Payment:</span> {selectedAppt.paymentStatus}</p>
                            
                            {selectedAppt.symptoms && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-slate-500 block mb-1">Reason / Symptoms:</span>
                                    <p className="text-slate-700 italic">{selectedAppt.symptoms}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule Controls */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Allocate Schedule</h4>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 mb-4 border-b border-slate-100 pb-2">Coordinate with the doctor and set the confirmed time.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Confirmed Date</label>
                                    <input 
                                        type="date" 
                                        value={scheduleData.confirmedDate} 
                                        onChange={e => setScheduleData({...scheduleData, confirmedDate: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Start Time (e.g. 10:30 AM)</label>
                                        <input 
                                            type="text" 
                                            value={scheduleData.confirmedStartTime} 
                                            onChange={e => setScheduleData({...scheduleData, confirmedStartTime: e.target.value})}
                                            placeholder="e.g. 10:30 AM"
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Duration (mins)</label>
                                        <input 
                                            type="number" 
                                            value={scheduleData.duration} 
                                            onChange={e => setScheduleData({...scheduleData, duration: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Admin Notes (Optional)</label>
                                    <textarea 
                                        value={scheduleData.schedulingNotes} 
                                        onChange={e => setScheduleData({...scheduleData, schedulingNotes: e.target.value})}
                                        placeholder="Internal notes or instructions for the doctor/patient..."
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 h-20"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleStatusUpdate(selectedAppt._id, 'Approved / Confirmed')}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded shadow-sm text-sm"
                            >
                                Schedule & Approve
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-3">Reject Request</h4>
                        <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                            <textarea 
                                placeholder="Reason for rejection (required)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border border-rose-300 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:border-rose-500 bg-white h-20"
                            ></textarea>
                            <button 
                                onClick={() => handleStatusUpdate(selectedAppt._id, 'Rejected')}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded shadow-sm text-sm"
                            >
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
