import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, Star, MapPin, Award, CheckCircle, Video, Users, CreditCard, Check, AlertCircle } from 'lucide-react';

const DoctorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Booking Workflow State
    const [step, setStep] = useState(1); // 1: Select Type, 2: Select Time, 3: Patient Details, 4: Payment, 5: Success
    const [consultationType, setConsultationType] = useState('Video');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTimeOfDay, setPreferredTimeOfDay] = useState('Any Time');
    const [alternativeDate, setAlternativeDate] = useState('');
    
    const [patientDetails, setPatientDetails] = useState({ name: '', email: '', phone: '', symptoms: '' });
    
    const [processing, setProcessing] = useState(false);
    const [appointmentId, setAppointmentId] = useState(null);

    useEffect(() => {
        fetchDoctor();
        const userStr = localStorage.getItem('userInfo') || localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setPatientDetails(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const res = await api.get(`/doctors/${id}`);
            setDoctor(res.data.doctor || res.data); // depending on backend format
            
            // Set a default date (tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setPreferredDate(tomorrow.toISOString().split('T')[0]);
            
        } catch (error) {
            console.error('Error fetching doctor details:', error);
        } finally {
            setLoading(false);
        }
    };

    

    const handleBack = () => setStep(step - 1);
    const handleNextStep = () => {
        
        if (step === 3 && (!patientDetails.name || !patientDetails.email || !patientDetails.phone)) {
            return alert("Please fill in all required patient details.");
        }
        setStep(step + 1);
    };

    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book an appointment');
            navigate('/login', { state: { from: `/doctors/${id}` } });
            return;
        }

        try {
            setProcessing(true);
            
            // Mock Payment Gateway Processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Calculate fee
            const fee = doctor.consultationFee;

            // Submit Appointment
            const res = await api.post('/appointments', {
                doctorId: doctor._id,
                patientName: patientDetails.name,
                patientEmail: patientDetails.email,
                patientContact: patientDetails.phone,
                symptoms: patientDetails.symptoms,
                preferredDate: preferredDate || null,
                preferredTimeOfDay,
                alternativeDate: alternativeDate || null,
                consultationType,
                feeSnapshot: fee,
                paymentStatus: 'Paid',
                paymentReference: 'TXN' + Math.random().toString().slice(2, 10),
                status: 'Paid - Awaiting Admin Review'
            });

            setAppointmentId(res.data?.appointment?._id || 'Success');
            setStep(5);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Payment & Booking failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading profile...</div>;
    if (!doctor) return <div className="text-center py-20 text-slate-500">Doctor not found</div>;

    const fee = doctor.consultationFee;
    const docName = doctor.userId?.name || 'Unnamed';

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl pb-20">
            {/* Step Progress Indicator */}
            {step < 5 && (
                <div className="mb-8 flex items-center justify-center">
                    <div className="flex items-center w-full max-w-3xl">
                        {[
                            { s: 1, label: 'Type' },
                            { s: 2, label: 'Time' },
                            { s: 3, label: 'Details' },
                            { s: 4, label: 'Payment' }
                        ].map((item, i) => (
                            <React.Fragment key={item.s}>
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= item.s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {step > item.s ? <Check size={16} /> : item.s}
                                    </div>
                                    <span className={`text-xs mt-1 absolute top-9 ${step >= item.s ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>{item.label}</span>
                                </div>
                                {i < 3 && <div className={`flex-1 h-1 ${step > item.s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl mb-4 overflow-hidden border-4 border-white shadow-md">
                            {doctor.imageUrl ? <img src={doctor.imageUrl} alt={docName} className="w-full h-full object-cover" /> : docName.charAt(0)}
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Dr. {docName}</h1>
                        <p className="text-blue-600 font-medium text-sm mb-2">{doctor.specialization}</p>
                        
                        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 mt-2 bg-slate-50 py-2 px-4 rounded-lg w-full">
                            <div className="flex items-center gap-1"><Award size={14} className="text-blue-500"/> {doctor.experienceYears} Yrs Exp.</div>
                            <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-current"/> {doctor.rating || '4.5'}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-5 text-sm">
                        <h2 className="font-bold text-slate-800 mb-3 border-b pb-2">Information</h2>
                        <div className="space-y-3 text-slate-600">
                            <p><strong className="text-slate-700">Qualifications:</strong> {doctor.qualifications?.join(', ')}</p>
                            <p><strong className="text-slate-700">Languages:</strong> {doctor.languagesSpoken?.join(', ')}</p>
                            <p><strong className="text-slate-700">Fee:</strong> ₹{fee}</p>
                        </div>
                    </div>
                </div>

                {/* Booking Wizard */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 min-h-[400px]">
                        
                        {/* Step 1: Consultation Type */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Consultation Type</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['Video', 'Both'].includes(doctor.consultationType) && (
                                        <button 
                                            onClick={() => setConsultationType('Video')}
                                            className={`p-6 rounded-xl border-2 flex flex-col items-center text-center transition-all ${consultationType === 'Video' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                                        >
                                            <Video size={32} className={consultationType === 'Video' ? 'text-blue-600 mb-3' : 'text-slate-400 mb-3'} />
                                            <h3 className={`font-bold ${consultationType === 'Video' ? 'text-blue-800' : 'text-slate-700'}`}>Video Consultation</h3>
                                            <p className="text-xs text-slate-500 mt-2">Consult securely online from anywhere.</p>
                                        </button>
                                    )}
                                    {['In-person', 'Both'].includes(doctor.consultationType) && (
                                        <button 
                                            onClick={() => setConsultationType('In-person')}
                                            className={`p-6 rounded-xl border-2 flex flex-col items-center text-center transition-all ${consultationType === 'In-person' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                                        >
                                            <Users size={32} className={consultationType === 'In-person' ? 'text-blue-600 mb-3' : 'text-slate-400 mb-3'} />
                                            <h3 className={`font-bold ${consultationType === 'In-person' ? 'text-blue-800' : 'text-slate-700'}`}>In-person Visit</h3>
                                            <p className="text-xs text-slate-500 mt-2">Visit the doctor at the clinic directly.</p>
                                        </button>
                                    )}
                                </div>
                                <div className="pt-6 mt-6 border-t flex justify-end">
                                    <button onClick={handleNextStep} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time Preferences */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Appointment</h2>
                                <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    Your selected date and time are preferences only. Our MediCare team will coordinate with the doctor and confirm your appointment after checking availability.
                                </p>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={preferredDate} 
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time of Day</label>
                                    <select 
                                        value={preferredTimeOfDay} 
                                        onChange={(e) => setPreferredTimeOfDay(e.target.value)}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Any Time">Any Time</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Afternoon">Afternoon</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Alternative Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={alternativeDate} 
                                        onChange={(e) => setAlternativeDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button onClick={handleBack} className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">Back</button>
                                    <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 ml-auto shadow-sm shadow-blue-200">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Patient Details */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Patient Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                                        <input type="text" required value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                                            <input type="email" required value={patientDetails.email} onChange={e => setPatientDetails({...patientDetails, email: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number *</label>
                                            <input type="tel" required value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for consultation / Symptoms</label>
                                        <textarea rows="3" value={patientDetails.symptoms} onChange={e => setPatientDetails({...patientDetails, symptoms: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Briefly describe your health concern..."></textarea>
                                    </div>
                                </div>
                                <div className="pt-6 mt-6 border-t flex justify-between">
                                    <button onClick={() => setStep(2)} className="text-slate-500 font-semibold px-4 hover:text-slate-800">Back</button>
                                    <button onClick={handleNextStep} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">Proceed to Payment</button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Payment Overview</h2>
                                
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Appointment Summary</h3>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex justify-between"><span className="font-medium text-slate-800">Doctor:</span> Dr. {docName}</div>
                                        <div className="flex justify-between"><span className="font-medium text-slate-800">Type:</span> {consultationType}</div>
                                        <div className="flex justify-between"><span className="font-medium text-slate-800">Date:</span> {preferredDate ? new Date(preferredDate).toDateString() : 'Any Date'}</div>
                                        <div className="flex justify-between"><span className="font-medium text-slate-800">Time:</span> {preferredTimeOfDay || 'Any Time'}</div>
                                        <div className="flex justify-between"><span className="font-medium text-slate-800">Patient:</span> {patientDetails.name}</div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex justify-between items-center">
                                    <span className="font-bold text-slate-800 text-lg">Total Amount</span>
                                    <span className="text-2xl font-extrabold text-blue-700">₹{fee}</span>
                                </div>

                                <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
                                    <p className="font-bold mb-1">Mock Payment Gateway</p>
                                    <p>Since Razorpay credentials are not configured, clicking the button below will simulate a successful payment and reserve the appointment.</p>
                                </div>

                                <div className="pt-6 mt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
                                    <button onClick={() => setStep(3)} disabled={processing} className="text-slate-500 font-semibold px-4 hover:text-slate-800 py-3 text-center">Back</button>
                                    <button 
                                        onClick={handlePayment} 
                                        disabled={processing}
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        <CreditCard size={18} /> {processing ? 'Processing Payment...' : `Pay ₹${fee} Securely`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Success */}
                        {step === 5 && (
                            <div className="text-center py-10 animate-fadeIn flex flex-col items-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-3">Booking Requested!</h2>
                                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                    Your appointment request has been successfully placed. Our team will review your preferences and coordinate with the doctor to confirm the schedule.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full max-w-md text-sm text-left mb-8">
                                    <p className="text-slate-500 mb-1">Appointment ID</p>
                                    <p className="font-mono font-bold text-slate-800">{appointmentId}</p>
                                    <p className="text-slate-500 mt-3 mb-1">Status</p>
                                    <p className="font-bold text-amber-600">Paid - Awaiting Admin Approval</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    View My Appointments
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfilePage;
