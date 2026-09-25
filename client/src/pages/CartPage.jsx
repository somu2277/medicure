import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, FileText, ChevronRight, MapPin, CheckCircle } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAddressStore from '../store/addressStore';
import AddressModal from '../components/AddressModal';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCartStore();
  const { selectedAddress, deliveryAvailable, deliveryEstimate } = useAddressStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const { mrpTotal, subtotal, discount, requiresPrescription } = getCartTotal();
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-48 h-48 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <img src="https://assets.pharmeasy.in/web-assets/images/emptyCart.png" alt="Empty Cart" className="w-32 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty!</h2>
        <p className="text-slate-500 mb-8">We have wide range of medicines and healthcare products.</p>
        <Link to="/medicines" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Order Summary</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Cart Items */}
          <div className="flex-grow lg:w-2/3">
            
            {/* Delivery Location Block */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex justify-between items-center">
                <div className="flex items-start gap-3">
                    <MapPin size={24} className="text-primary pt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Deliver to:</p>
                        {selectedAddress ? (
                            <p className="text-slate-800 font-bold">
                                {selectedAddress.fullName}, {selectedAddress.pincode}
                                <span className="block text-xs font-normal text-slate-500 truncate max-w-sm">
                                    {selectedAddress.house}, {selectedAddress.locality}
                                </span>
                            </p>
                        ) : (
                            <p className="text-slate-800 font-bold">Select a delivery location</p>
                        )}
                        {selectedAddress && deliveryAvailable !== null && (
                           <div className={`mt-1 text-xs font-semibold flex items-center gap-1 ${deliveryAvailable ? 'text-success' : 'text-error'}`}>
                              {deliveryAvailable ? (
                                  <><CheckCircle size={12} /> Delivery by {deliveryEstimate}</>
                              ) : (
                                  '⚠ Not deliverable to this pincode'
                              )}
                           </div>
                        )}
                    </div>
                </div>
                <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-primary font-medium hover:underline text-sm px-3 py-1.5 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                >
                    Change
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-semibold text-slate-700">Items in Cart ({cartItems.length})</span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 p-2 border border-slate-200">
                      {/* Image Placeholder */}
                      <span className="text-xs text-slate-400">IMG</span>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-slate-500">{item.brand}</p>
                          {item.prescriptionRequired && (
                            <span className="inline-flex items-center gap-1 bg-warning/10 text-warning text-xs font-semibold px-2 py-1 rounded mt-2">
                              <FileText size={12} /> Rx Required
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="text-slate-400 hover:text-error transition-colors p-1"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-slate-800">₹{item.sellingPrice}</span>
                          {item.mrp > item.sellingPrice && (
                            <span className="text-sm text-slate-400 line-through">₹{item.mrp}</span>
                          )}
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-300 rounded-full bg-white">
                          <button 
                            onClick={() => updateQuantity(item._id, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-primary transition-colors disabled:opacity-50"
                            disabled={item.qty <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {requiresPrescription && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <FileText className="text-warning flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="font-semibold text-slate-800">Prescription Required</h4>
                  <p className="text-sm text-slate-600 mt-1">One or more items in your cart require a valid medical prescription. You will be asked to upload it in the next step.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Bill Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4">Bill Summary</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Value</span>
                  <span className="line-through">₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Selling Price</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-success font-medium">
                  <span>Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-success font-medium">FREE</span> : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-slate-400 text-right mt-0">Add items worth ₹{500 - subtotal} more for free delivery</p>
                )}
              </div>
              
              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">Amount to be paid</span>
                  <span className="font-bold text-xl text-slate-800">₹{totalAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="bg-success/10 text-success text-xs font-semibold px-3 py-2 rounded text-center">
                    Total Savings: ₹{discount.toFixed(2)}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/medicines')}
                className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-lg shadow-sm transition-colors text-center mb-3"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => navigate('/checkout')}
                disabled={!selectedAddress || deliveryAvailable === false}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delivery Address Modal */}
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </div>
  );
};

export default CartPage;
