import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const LabTestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    patientDetails: { name: '', age: '', gender: 'Male' },
    collectionAddress: { addressLine: '', city: '', state: '', pincode: '' },
    appointmentDate: '',
    appointmentTimeSlot: 'Morning (8AM - 12PM)'
  });

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/lab-tests/${id}`);
        setTest(response.data);
      } catch (error) {
        console.error('Error fetching lab test:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setBookingData(prev => ({
        ...prev,
        collectionAddress: {
          addressLine: defaultAddress.addressLine,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode
        }
      }));
    }
  }, [user]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/lab-tests/' + id);
      return;
    }
    try {
      await api.post('/lab-bookings', {
        labTestId: id,
        ...bookingData
      });
      alert('Booking successful!');
      navigate('/');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!test) return <div className="text-center py-20">Test not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{test.name}</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <p className="text-gray-600 mb-6">{test.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div><strong>Price:</strong> ₹{test.price}</div>
          <div><strong>Category:</strong> {test.category}</div>
          <div><strong>Report Time:</strong> {test.reportTime || 'N/A'}</div>
          <div><strong>Sample Type:</strong> {test.sampleType || 'N/A'}</div>
          <div><strong>Preparation:</strong> {test.testPreparation || 'N/A'}</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Book Home Collection</h2>
      <form onSubmit={handleBooking} className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 text-lg border-b pb-2">Patient Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input required type="text" placeholder="Patient Name" className="border p-2 rounded" 
            value={bookingData.patientDetails.name} 
            onChange={e => setBookingData({...bookingData, patientDetails: {...bookingData.patientDetails, name: e.target.value}})} />
          <input required type="number" placeholder="Age" className="border p-2 rounded" 
            value={bookingData.patientDetails.age} 
            onChange={e => setBookingData({...bookingData, patientDetails: {...bookingData.patientDetails, age: e.target.value}})} />
          <select className="border p-2 rounded" value={bookingData.patientDetails.gender}
            onChange={e => setBookingData({...bookingData, patientDetails: {...bookingData.patientDetails, gender: e.target.value}})}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <h3 className="font-semibold mb-4 text-lg border-b pb-2">Collection Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input required type="text" placeholder="Address Line" className="border p-2 rounded md:col-span-2" 
            value={bookingData.collectionAddress.addressLine} 
            onChange={e => setBookingData({...bookingData, collectionAddress: {...bookingData.collectionAddress, addressLine: e.target.value}})} />
          <input required type="text" placeholder="City" className="border p-2 rounded" 
            value={bookingData.collectionAddress.city} 
            onChange={e => setBookingData({...bookingData, collectionAddress: {...bookingData.collectionAddress, city: e.target.value}})} />
          <input required type="text" placeholder="State" className="border p-2 rounded" 
            value={bookingData.collectionAddress.state} 
            onChange={e => setBookingData({...bookingData, collectionAddress: {...bookingData.collectionAddress, state: e.target.value}})} />
          <input required type="text" placeholder="Pincode" className="border p-2 rounded" 
            value={bookingData.collectionAddress.pincode} 
            onChange={e => setBookingData({...bookingData, collectionAddress: {...bookingData.collectionAddress, pincode: e.target.value}})} />
        </div>

        <h3 className="font-semibold mb-4 text-lg border-b pb-2">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input required type="date" className="border p-2 rounded" min={new Date().toISOString().split('T')[0]}
            value={bookingData.appointmentDate} 
            onChange={e => setBookingData({...bookingData, appointmentDate: e.target.value})} />
          <select className="border p-2 rounded" value={bookingData.appointmentTimeSlot}
            onChange={e => setBookingData({...bookingData, appointmentTimeSlot: e.target.value})}>
            <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
            <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
            <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700">
          Confirm Booking - Pay ₹{test.price} (COD)
        </button>
      </form>
    </div>
  );
};

export default LabTestDetailPage;
