import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Home, Briefcase, Map, Navigation, CheckCircle } from 'lucide-react';
import useAddressStore from '../store/addressStore';
import useAuthStore from '../store/authStore';

const AddressModal = ({ isOpen, onClose }) => {
    const { 
        addresses, 
        selectedAddress, 
        fetchAddresses, 
        addAddress, 
        updateAddress, 
        deleteAddress, 
        setSelectedAddress,
        loading,
        lookupPincode
    } = useAddressStore();
    
    const { userInfo } = useAuthStore();
    
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        pincode: '',
        house: '',
        locality: '',
        city: '',
        state: '',
        addressType: 'Home',
        isDefault: false
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isLocating, setIsLocating] = useState(false);
    
    useEffect(() => {
        if (isOpen && userInfo) {
            fetchAddresses();
            setView('list');
        }
    }, [isOpen, userInfo]);

    if (!isOpen) return null;

    if (!userInfo) {
        return (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
                        <X size={24} />
                    </button>
                    <div className="text-center py-8">
                        <MapPin className="mx-auto text-slate-400 mb-4" size={48} />
                        <h2 className="text-xl font-bold mb-2">Login Required</h2>
                        <p className="text-slate-500 mb-6">Please login to manage your delivery addresses.</p>
                        <a href="/login" className="bg-primary text-white px-6 py-2 rounded-lg font-medium">Login to Continue</a>
                    </div>
                </div>
            </div>
        );
    }

    const resetForm = () => {
        setFormData({
            fullName: userInfo?.name || '',
            phone: userInfo?.phone || '',
            pincode: '',
            house: '',
            locality: '',
            city: '',
            state: '',
            addressType: 'Home',
            isDefault: false
        });
        setFormErrors({});
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        onClose();
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    
                    setFormData(prev => ({
                        ...prev,
                        pincode: data.address.postcode || '',
                        city: data.address.city || data.address.town || data.address.state_district || '',
                        state: data.address.state || '',
                        locality: data.address.suburb || data.address.neighbourhood || ''
                    }));
                    setView('add');
                } catch (error) {
                    console.error("Geocoding failed", error);
                    alert("Failed to reverse geocode location.");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("GPS Error", error);
                alert('Could not get your location. Please allow GPS permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handlePincodeChange = async (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, pincode: val }));
        
        if (val.length === 6) {
            const res = await lookupPincode(val);
            if (res.success) {
                setFormData(prev => ({
                    ...prev,
                    city: res.city || prev.city,
                    state: res.state || prev.state,
                    locality: res.locality || prev.locality
                }));
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = "Name is required";
        if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = "Valid phone is required";
        if (!formData.pincode.trim() || formData.pincode.length !== 6) errors.pincode = "Valid 6-digit Pincode is required";
        if (!formData.house.trim()) errors.house = "House/Flat No is required";
        if (!formData.locality.trim()) errors.locality = "Locality is required";
        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.state.trim()) errors.state = "State is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (view === 'edit' && editingAddress) {
                await updateAddress(editingAddress._id, formData);
            } else {
                await addAddress(formData);
            }
            setView('list');
        } catch (error) {
            console.error(error);
            alert("Failed to save address");
        }
    };

    const openEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            fullName: address.fullName,
            phone: address.phone,
            pincode: address.pincode,
            house: address.house,
            locality: address.locality,
            city: address.city,
            state: address.state,
            addressType: address.addressType,
            isDefault: address.isDefault
        });
        setView('edit');
    };

    const getIcon = (type) => {
        if (type === 'Home') return <Home size={18} />;
        if (type === 'Work') return <Briefcase size={18} />;
        return <Map size={18} />;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800">
                        {view === 'list' ? 'Select delivery address' : view === 'add' ? 'Add New Address' : 'Edit Address'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:bg-slate-100 p-1 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
                    
                    {view === 'list' && (
                        <div className="space-y-4">
                            <button 
                                onClick={handleDetectLocation}
                                disabled={isLocating}
                                className="w-full flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                <Navigation size={20} className={isLocating ? "animate-pulse" : ""} />
                                <span className="font-medium">{isLocating ? 'Detecting location...' : 'Use my current location'}</span>
                            </button>

                            {loading && addresses.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin className="mx-auto text-slate-300 mb-3" size={40} />
                                    <p className="text-slate-500">No saved addresses found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Saved Addresses</h3>
                                    {addresses.map(addr => {
                                        const isSelected = selectedAddress?._id === addr._id;
                                        return (
                                            <div key={addr._id} className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-primary bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className="pt-1">
                                                        <div 
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${isSelected ? 'border-primary bg-primary' : 'border-slate-300'}`}
                                                            onClick={() => handleSelectAddress(addr)}
                                                        >
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 cursor-pointer" onClick={() => handleSelectAddress(addr)}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-slate-800">{addr.fullName}</span>
                                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                {getIcon(addr.addressType)} {addr.addressType}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-1">
                                                            {addr.house}, {addr.locality}<br/>
                                                            {addr.city}, {addr.state} - {addr.pincode}
                                                        </p>
                                                        <p className="text-sm text-slate-600">Mobile: <span className="font-medium">{addr.phone}</span></p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-4 text-sm">
                                                    <button onClick={() => openEdit(addr)} className="text-blue-600 font-medium hover:underline">Edit</button>
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm('Delete this address?')) deleteAddress(addr._id);
                                                        }} 
                                                        className="text-red-600 font-medium hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <button 
                                onClick={() => { resetForm(); setView('add'); }}
                                className="w-full mt-4 flex justify-center items-center gap-2 border-2 border-dashed border-primary text-primary p-4 rounded-xl font-medium hover:bg-primary/5 transition-colors"
                            >
                                <Plus size={20} />
                                Add New Address
                            </button>
                        </div>
                    )}

                    {(view === 'add' || view === 'edit') && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                    <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.fullName ? 'border-red-500' : 'border-slate-300'}`} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. John Doe" />
                                    {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                                    <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.phone ? 'border-red-500' : 'border-slate-300'}`} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="10-digit number" />
                                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
                                    <input type="text" maxLength={6} className={`w-full p-2.5 border rounded-lg ${formErrors.pincode ? 'border-red-500' : 'border-slate-300'}`} value={formData.pincode} onChange={handlePincodeChange} placeholder="e.g. 518008" />
                                    {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                                    <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.city ? 'border-red-500' : 'border-slate-300'}`} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">House/Flat/Building *</label>
                                <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.house ? 'border-red-500' : 'border-slate-300'}`} value={formData.house} onChange={e => setFormData({...formData, house: e.target.value})} />
                                {formErrors.house && <p className="text-red-500 text-xs mt-1">{formErrors.house}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Area/Locality *</label>
                                    <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.locality ? 'border-red-500' : 'border-slate-300'}`} value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} />
                                    {formErrors.locality && <p className="text-red-500 text-xs mt-1">{formErrors.locality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                                    <input type="text" className={`w-full p-2.5 border rounded-lg ${formErrors.state ? 'border-red-500' : 'border-slate-300'}`} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                                    {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Address Type</label>
                                <div className="flex gap-4">
                                    {['Home', 'Work', 'Other'].map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="addressType" 
                                                value={type} 
                                                checked={formData.addressType === type} 
                                                onChange={e => setFormData({...formData, addressType: e.target.value})}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer mt-4 border-t pt-4">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isDefault} 
                                    onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                                    className="w-4 h-4 rounded text-primary"
                                />
                                <span className="font-medium text-slate-700">Make this my default address</span>
                            </label>

                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setView('list')} className="flex-1 py-3 px-4 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70">
                                    {loading ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
