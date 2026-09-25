import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    medicalRegistrationNumber: '',
    consultationFee: '',
    status: 'Pending'
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Verified, Pending

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
        name: doc.name || '',
        email: doc.email || '',
        password: '',
        specialization: doc.specialization || '',
        experience: doc.experience || '',
        medicalRegistrationNumber: doc.medicalRegistrationNumber || '',
        consultationFee: doc.consultationFee || '',
        status: doc.status || 'Pending'
      });
    } else {
      setEditData(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        medicalRegistrationNumber: '',
        consultationFee: '',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      alert('Failed to save doctor');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };
  
  const handleVerify = async (id) => {
    if (!window.confirm('Are you sure you want to verify this doctor?')) return;
    try {
      await api.put(`/admin/doctors/${id}`, { status: 'Verified' });
      fetchDoctors();
    } catch (err) {
      alert('Failed to verify doctor');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (doc.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-64 shadow-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm bg-white"
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">No doctors found.</div>
        ) : (
          filteredDoctors.map(doc => (
            <div key={doc._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800">{doc.name || 'Unnamed Doctor'}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal(doc)} className="text-slate-400 hover:text-teal-600"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(doc._id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">{doc.email}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-medium text-slate-700">{doc.specialization}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-medium text-slate-700">{doc.experience} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fee:</span>
                  <span className="font-medium text-slate-700">?{doc.consultationFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reg No:</span>
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{doc.medicalRegistrationNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {doc.status === 'Verified' ? <CheckCircle size={16} className="text-teal-600" /> : <Clock size={16} className="text-amber-500" />}
                  <span className={doc.status === 'Verified' ? 'text-teal-600' : 'text-amber-500'}>{doc.status}</span>
                </div>
                {doc.status === 'Pending' && (
                  <button 
                    onClick={() => handleVerify(doc._id)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editData ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="doctor@example.com"
                  />
                </div>
                {!editData && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      required
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                      placeholder="Secure password"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                  <input 
                    required
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="e.g. Cardiologist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (?)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medical Reg. Number</label>
                  <input 
                    required
                    type="text" 
                    value={formData.medicalRegistrationNumber}
                    onChange={(e) => setFormData({...formData, medicalRegistrationNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" 
                    placeholder="e.g. MED1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
                  {editData ? 'Save Changes' : 'Add Doctor'}
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

