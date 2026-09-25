import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText, CreditCard, CheckCircle, Upload, Loader2, Home, Briefcase, Map } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAddressStore from '../store/addressStore';
import api from '../utils/api';
import AddressModal from '../components/AddressModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const { selectedAddress, deliveryAvailable } = useAddressStore();
  
  const { mrpTotal, subtotal, discount, requiresPrescription } = getCartTotal();
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  const [step, setStep] = useState(1);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [prescriptionStatus, setPrescriptionStatus] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty and order is not placed, redirect safely via useEffect
  React.useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cartItems.length, orderPlaced, navigate]);

  if (cartItems.length === 0 && !orderPlaced) {
    return null; // Return null while redirecting
  }

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId || item._id, // Fallback for legacy cart items
          productRef: item._id, // Add Mongo ObjectId reference
          name: item.name,
          quantity: item.qty,
          price: item.sellingPrice,
          subtotal: item.sellingPrice * item.qty
        })),
        address: selectedAddress ? {
          addressLine: `${selectedAddress.house}, ${selectedAddress.locality}`,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        } : null,
        subtotal,
        discount,
        deliveryFee,
        total: totalAmount,
        paymentStatus: 'PENDING'
      };

      const response = await api.post('/orders', orderPayload);
      if (response.data.success) {
        setOrderPlaced(true);
        clearCart();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6 text-success">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Order Placed Successfully!</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Your order #{Math.floor(Math.random() * 1000000)} has been placed. We'll send you an update once it's confirmed.
        </p>
        <button 
          onClick={() => navigate('/medicines')}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Secure Checkout</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Checkout Flow */}
          <div className="flex-grow space-y-6 md:w-2/3">
            
            {/* Step 1: Address */}
            <div className={`bg-white rounded-xl shadow-sm border ${step === 1 ? 'border-primary' : 'border-slate-200'} overflow-hidden`}>
              <div 
                className={`p-4 sm:p-6 flex items-center gap-4 ${step === 1 ? 'bg-primary/5' : ''} ${step > 1 ? 'cursor-pointer' : ''}`}
                onClick={() => step > 1 && setStep(1)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${step === 1 ? 'bg-primary text-white' : step > 1 ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > 1 ? <CheckCircle size={16} /> : '1'}
                </div>
                <div className="flex-grow">
                  <h2 className={`text-lg font-bold ${step === 1 ? 'text-primary' : 'text-slate-800'}`}>Delivery Address</h2>
                  {step > 1 && selectedAddress && <p className="text-sm text-slate-500 mt-1">{selectedAddress.fullName}, {selectedAddress.city} - {selectedAddress.pincode}</p>}
                </div>
              </div>
              
              {step === 1 && (
                <div className="p-4 sm:p-6 border-t border-slate-100">
                  {selectedAddress ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border-2 border-primary bg-blue-50/30">
                        <div className="flex items-start gap-3">
                            <div className="pt-1 text-primary">
                                {selectedAddress.addressType === 'Home' ? <Home size={20} /> : selectedAddress.addressType === 'Work' ? <Briefcase size={20} /> : <Map size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">{selectedAddress.fullName}</span>
                                        <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                            {selectedAddress.addressType}
                                        </span>
                                    </div>
                                    <button 
                                      onClick={() => setIsAddressModalOpen(true)}
                                      className="text-primary font-medium text-sm hover:underline"
                                    >
                                      Change
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 mb-1">
                                    {selectedAddress.house}, {selectedAddress.locality}<br/>
                                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                </p>
                                <p className="text-sm text-slate-600">Mobile: <span className="font-medium">{selectedAddress.phone}</span></p>
                            </div>
                        </div>
                      </div>
                      
                      {!deliveryAvailable && deliveryAvailable !== null && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                          <span>Delivery is not available to this pincode. Please select a different address.</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (selectedAddress && deliveryAvailable !== false) {
                            setStep(requiresPrescription ? 2 : 3);
                          }
                        }}
                        disabled={!selectedAddress || deliveryAvailable === false}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors mt-2 disabled:opacity-50"
                      >
                        Deliver Here & Continue
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 mb-2">No Delivery Address</h3>
                      <p className="text-slate-500 mb-6">Please select or add a new delivery address to continue checkout.</p>
                      <button 
                        onClick={() => setIsAddressModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Prescription (Optional based on cart) */}
            {requiresPrescription && (
              <div className={`bg-white rounded-xl shadow-sm border ${step === 2 ? 'border-primary' : 'border-slate-200'} overflow-hidden`}>
                <div 
                  className={`p-4 sm:p-6 flex items-center gap-4 ${step === 2 ? 'bg-primary/5' : ''} ${step > 2 ? 'cursor-pointer' : ''}`}
                  onClick={() => step > 2 && setStep(2)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${step === 2 ? 'bg-primary text-white' : step > 2 ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step > 2 ? <CheckCircle size={16} /> : '2'}
                  </div>
                  <div className="flex-grow">
                    <h2 className={`text-lg font-bold ${step === 2 ? 'text-primary' : 'text-slate-800'}`}>Upload Prescription</h2>
                    {step > 2 && <p className="text-sm text-slate-500 mt-1">Prescription attached</p>}
                  </div>
                </div>
                
                {step === 2 && (
                  <div className="p-4 sm:p-6 border-t border-slate-100">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer mb-4">
                      <div className="bg-primary/10 p-3 rounded-full text-primary mb-3">
                        <Upload size={24} />
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">Click to upload or drag & drop</h3>
                      <p className="text-xs text-slate-500">JPG, PNG or PDF (Max. 5MB)</p>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setPrescriptionStatus(true);
                          setStep(3);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                      >
                        Upload & Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            <div className={`bg-white rounded-xl shadow-sm border ${step === 3 ? 'border-primary' : 'border-slate-200'} overflow-hidden`}>
              <div className={`p-4 sm:p-6 flex items-center gap-4 ${step === 3 ? 'bg-primary/5' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${step === 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {requiresPrescription ? '3' : '2'}
                </div>
                <h2 className={`text-lg font-bold ${step === 3 ? 'text-primary' : 'text-slate-800'}`}>Payment Options</h2>
              </div>
              
              {step === 3 && (
                <div className="p-4 sm:p-6 border-t border-slate-100">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                      <input type="radio" name="payment" className="text-primary focus:ring-primary w-4 h-4" defaultChecked />
                      <div className="flex items-center gap-2">
                        <CreditCard size={20} className="text-primary" />
                        <span className="font-medium text-slate-800">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors text-lg flex items-center justify-center min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4">Amount to Pay</h3>
              <div className="text-3xl font-bold text-slate-900 mb-6">₹{totalAmount.toFixed(2)}</div>
              
              <div className="space-y-3 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Cart Value</span>
                  <span>₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                By placing the order, you agree to MediCare's Terms of Use and Privacy Policy.
              </p>
            </div>
          </div>
          
        </div>
      </div>
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </div>
  );
};

export default CheckoutPage;
