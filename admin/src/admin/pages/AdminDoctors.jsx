import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle, Clock, XCircle, AlertTriangle, ShieldOff } from 'lucide-react';
import api from '../../utils/api';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialization: '', experience: '',
    medicalRegistrationNumber: '', registrationAuthority: '',
    qualifications: '', languagesSpoken: '',
    hospitalName: '', clinicAddress: '',
    consultationFee: '', followUpFee: '',
    consultationType: 'Video', consultationDuration: 30,
    bio: '', imageUrl: '', status: 'Pending Verification'
  });

  const [verifyData, setVerifyData] = useState({ status: '', rejectionReason: '' });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/doctors');
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openModal = (doc = null) => {
    if (doc) {
      setEditData(doc);
      setFormData({
        name: doc.userId?.name || '',
        email: doc.userId?.email || '',
        password: '',
        specialization: doc.specialization || '',
        experience: doc.experienceYears || '',
        medicalRegistrationNumber: doc.medicalRegistrationNumber || '',
        registrationAuthority: doc.registrationAuthority || '',
        qualifications: doc.qualifications ? doc.qualifications.join(', ') : '',
        languagesSpoken: doc.languagesSpoken ? doc.languagesSpoken.join(', ') : '',
        hospitalName: doc.hospitalName || '',
        clinicAddress: doc.clinicAddress || '',
        consultationFee: doc.consultationFee || '',
        followUpFee: doc.followUpFee || '',
        consultationType: doc.consultationType || 'Video',
        consultationDuration: doc.consultationDuration || 30,
        bio: doc.bio || '',
        imageUrl: doc.imageUrl || '',
        status: doc.status || 'Pending Verification'
      });
    } else {
      setEditData(null);
      setFormData({
        name: '', email: '', password: '', specialization: '', experience: '',
        medicalRegistrationNumber: '', registrationAuthority: '',
        qualifications: '', languagesSpoken: '',
        hospitalName: '', clinicAddress: '',
        consultationFee: '', followUpFee: '',
        consultationType: 'Video', consultationDuration: 30,
        bio: '', imageUrl: '', status: 'Pending Verification'
      });
    }
    setIsModalOpen(true);
  };

  const openVerifyModal = (doc) => {
    setEditData(doc);
    setVerifyData({ status: 'Verified', rejectionReason: '' });
    setIsVerifyModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsVerifyModalOpen(false);
    setEditData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/admin/doctors/${editData._id}`, formData);
      } else {
        await api.post('/admin/doctors', formData);
      }
      closeModal();
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/doctors/${editData._id}/verify`, verifyData);
      closeModal();
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor entirely? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = (doc.userId?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (doc.userId?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Verified': return <CheckCircle size={16} className="text-emerald-600" />;
      case 'Pending Verification': return <Clock size={16} className="text-amber-500" />;
      case 'Rejected': return <XCircle size={16} className="text-red-500" />;
      case 'Suspended': return <ShieldOff size={16} className="text-rose-600" />;
      case 'Inactive': return <AlertTriangle size={16} className="text-slate-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'text-emerald-600';
      case 'Pending Verification': return 'text-amber-500';
      case 'Rejected': return 'text-red-500';
      case 'Suspended': return 'text-rose-600';
      case 'Inactive': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Doctor Management</h2>
          <p className="text-slate-500 text-sm mt-1">Add, verify, and manage platform doctors.</p>
        </div>
        <button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search doctors by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-full sm:w-48"
        >
          <option value="All">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Rejected">Rejected</option>
          <option value="Suspended">Suspended</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            No doctors found matching your criteria.
          </div>
        ) : (
          filteredDoctors.map(doc => (
            <div key={doc._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg overflow-hidden border border-teal-200">
                      {doc.imageUrl ? <img src={doc.imageUrl} alt="Doc" className="w-full h-full object-cover" /> : (doc.userId?.name ? doc.userId.name.charAt(0).toUpperCase() : 'D')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight truncate w-32" title={doc.userId?.name}>{doc.userId?.name || 'Unnamed'}</h3>
                      <p className="text-xs text-slate-500">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(doc)} className="w-7 h-7 rounded bg-slate-100 text-slate-500 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors" title="Edit"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(doc._id)} className="w-7 h-7 rounded bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors" title="Delete"><Trash2 size={14}/></button>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-medium text-slate-700">{doc.experienceYears} yrs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Fee:</span>
                    <span className="font-medium text-slate-700">₹{doc.consultationFee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Reg No:</span>
                    <span className="font-mono font-medium text-slate-700">{doc.medicalRegistrationNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-medium text-slate-700">{doc.consultationType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {getStatusIcon(doc.status)}
                  <span className={getStatusColor(doc.status)}>{doc.status}</span>
                </div>
                {doc.status !== 'Verified' && doc.status !== 'Rejected' && (
                  <button 
                    onClick={() => openVerifyModal(doc)}
                    className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors"
                  >
                    Action
                  </button>
                )}
                {(doc.status === 'Verified' || doc.status === 'Rejected') && (
                  <button 
                    onClick={() => openVerifyModal(doc)}
                    className="text-xs font-medium text-slate-600 hover:text-teal-600 px-2 py-1"
                  >
                    Change Status
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editData ? 'Edit Doctor Profile' : 'Register New Doctor'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form id="doctorForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Basic Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="Dr. John Doe"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Login Email *</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="doctor@example.com"/>
                    </div>
                    {!editData && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                        <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="Secure password"/>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
                      <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="https://example.com/photo.jpg"/>
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Info */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Professional Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Specialization *</label>
                      <input required type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="e.g. Cardiologist"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years) *</label>
                      <input required type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="e.g. 10"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Medical Reg. Number *</label>
                      <input required type="text" value={formData.medicalRegistrationNumber} onChange={(e) => setFormData({...formData, medicalRegistrationNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="e.g. MED1234567"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registration Authority</label>
                      <input type="text" value={formData.registrationAuthority} onChange={(e) => setFormData({...formData, registrationAuthority: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="e.g. Medical Council of India"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications (Comma separated)</label>
                      <input type="text" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="MBBS, MD - Cardiology"/>
                    </div>
                  </div>
                </div>

                {/* Section 3: Clinic & Consultation */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Consultation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (₹) *</label>
                      <input required type="number" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="500"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Fee (₹)</label>
                      <input type="number" value={formData.followUpFee} onChange={(e) => setFormData({...formData, followUpFee: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="300"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Duration (mins)</label>
                      <input type="number" value={formData.consultationDuration} onChange={(e) => setFormData({...formData, consultationDuration: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="30"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Type</label>
                      <select value={formData.consultationType} onChange={(e) => setFormData({...formData, consultationType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white">
                        <option value="Video">Video Only</option>
                        <option value="In-person">In-person Only</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
                      <input type="text" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="City Care Hospital"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Languages (Comma separated)</label>
                      <input type="text" value={formData.languagesSpoken} onChange={(e) => setFormData({...formData, languagesSpoken: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="English, Hindi"/>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Address</label>
                      <input type="text" value={formData.clinicAddress} onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="123 Health Ave, Medical District..."/>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Biography / About</label>
                      <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="Brief doctor biography..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white">
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Verified">Verified (Active)</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button form="doctorForm" type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm">
                {editData ? 'Save Changes' : 'Register Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification / Status Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Update Doctor Status</h2>
              <button onClick={closeModal} className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleVerifySubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-sm">
                <p><strong>Doctor:</strong> {editData?.userId?.name}</p>
                <p><strong>Reg No:</strong> {editData?.medicalRegistrationNumber}</p>
                <p><strong>Current Status:</strong> <span className={getStatusColor(editData?.status)}>{editData?.status}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Status *</label>
                <select required value={verifyData.status} onChange={(e) => setVerifyData({...verifyData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white">
                  <option value="Verified">Verified (Approve & Active)</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {verifyData.status === 'Rejected' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason *</label>
                  <textarea required rows="3" value={verifyData.rejectionReason} onChange={(e) => setVerifyData({...verifyData, rejectionReason: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="Please provide a reason for rejection..."></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm">
                  Confirm Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
