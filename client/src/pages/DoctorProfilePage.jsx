import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, Star, MapPin, Award, CheckCircle } from 'lucide-react';

const DoctorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const res = await api.get(/doctors/);
            setDoctor(res.data);
            
            // Set a default date (tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow.toISOString().split('T')[0]);
            
        } catch (error) {
            console.error('Error fetching doctor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateTimeSlots = () => {
        return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            alert('Please select date and time');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book an appointment');
            navigate('/login', { state: { from: /doctors/ } });
            return;
        }

        try {
            setBooking(true);
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const patientId = user ? user.id : null;

            await api.post('/appointments', {
                doctorId: id,
                patientId: patientId, // fallback if token doesn't supply it
                date: selectedDate,
                startTime: selectedTime.split(' ')[0],
                endTime: selectedTime.split(' ')[0], // simplify for mock
                symptoms
            });
            setSuccess(true);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading profile...</div>;
    if (!doctor) return <div className="text-center py-20">Doctor not found</div>;

    if (success) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-lg">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Appointment Confirmed!</h2>
                <p className="text-slate-600 mb-8">
                    Your appointment with Dr. {doctor.userId?.name} has been successfully booked for {selectedDate} at {selectedTime}.
                </p>
                <button 
                    onClick={() => navigate('/doctors')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Doctors
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl shrink-0">
                            {doctor.userId?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dr. {doctor.userId?.name}</h1>
                            <p className="text-xl text-blue-600 font-medium mb-4">{doctor.specialization}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1"><Award size={16}/> {doctor.experienceYears} Years Exp.</div>
                                <div className="flex items-center gap-1"><MapPin size={16}/> Medical Center, City</div>
                                <div className="flex items-center gap-1 text-yellow-500"><Star size={16} className="fill-current"/> {doctor.rating || '4.5'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">About Doctor</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {doctor.bio || Dr.  is a renowned  with over  years of experience in providing excellent patient care.}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Qualifications</h2>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2">
                            {doctor.qualifications?.map((q, i) => (
                                <li key={i}>{q}</li>
                            )) || <li>MBBS, MD</li>}
                        </ul>
                    </div>
                </div>

                {/* Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Book Appointment</h2>
                        <p className="text-slate-500 text-sm mb-6">Consultation Fee: <span className="font-bold text-slate-800 text-lg">?{doctor.consultationFee}</span></p>

                        <form onSubmit={handleBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Time Slot</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {generateTimeSlots().map(time => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => setSelectedTime(time)}
                                            className={py-2 px-1 text-sm rounded border text-center transition-colors }
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms (Optional)</label>
                                <textarea 
                                    rows="3"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Briefly describe your symptoms..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={booking}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {booking ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfilePage;
