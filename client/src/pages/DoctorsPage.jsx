import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, Star, Calendar } from 'lucide-react';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [specialization, setSpecialization] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, [specialization]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/doctors', { params: { specialization: specialization || undefined } });
            setDoctors(res.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const nameMatch = doc.userId?.name?.toLowerCase().includes(search.toLowerCase());
        const specMatch = doc.specialization?.toLowerCase().includes(search.toLowerCase());
        return nameMatch || specMatch;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Find a Doctor</h1>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search doctors by name or specialty..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex-shrink-0 w-full md:w-64 relative">
                    <Filter className="absolute left-3 top-3 text-slate-400" size={20} />
                    <select 
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">All Specialties</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="General Physician">General Physician</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading doctors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor._id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {doctor.userId?.name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Dr. {doctor.userId?.name}</h3>
                                        <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <p className="text-sm text-slate-600"><span className="font-semibold">Experience:</span> {doctor.experienceYears} Years</p>
                                    <p className="text-sm text-slate-600"><span className="font-semibold">Consultation Fee:</span> ?{doctor.consultationFee}</p>
                                    <div className="flex items-center text-yellow-500 text-sm">
                                        <Star size={16} className="fill-current mr-1" />
                                        <span>{doctor.rating || '4.5'} ({doctor.reviewsCount || '10'} reviews)</span>
                                    </div>
                                </div>
                                <Link 
                                    to={/doctors/}
                                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Calendar size={18} /> Book Appointment
                                </Link>
                            </div>
                        </div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No doctors found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
