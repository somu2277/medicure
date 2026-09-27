import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import socket from '../utils/socket';
import { ChevronRight, MapPin, CheckCircle, ShoppingCart } from 'lucide-react';
import useAddressStore from '../store/addressStore';
import useCartStore from '../store/cartStore';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState('Offline');
  const { selectedAddress, deliveryAvailable, deliveryEstimate } = useAddressStore();
  
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCartStore();
  const cartItem = product ? cartItems.find(item => item._id === product._id) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (data.success && data.product) {
          setProduct(data.product);
        } else if (data._id) {
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    if (!socket.connected) socket.connect();

    socket.on('connect', () => setSocketStatus('Live'));
    socket.on('disconnect', () => setSocketStatus('Offline'));
    socket.io.on('reconnect_attempt', () => setSocketStatus('Reconnecting'));

    const handleUpdate = (updatedProduct) => {
      if (updatedProduct._id === id || updatedProduct.productId === id) {
        setProduct(updatedProduct);
      } else {
        // Fallback refetch to ensure fresh data
        fetchProduct();
      }
    };

    socket.on('product:updated', handleUpdate);
    socket.on('product:stockUpdated', handleUpdate);
    socket.on('product:priceUpdated', handleUpdate);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
      socket.off('product:updated', handleUpdate);
      socket.off('product:stockUpdated', handleUpdate);
      socket.off('product:priceUpdated', handleUpdate);
    };
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading product...</div>;
  if (!product) return <div className="p-12 text-center text-slate-500">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Real-time Indicator */}
      <div className="flex justify-end mb-4 text-xs font-medium">
        {socketStatus === 'Live' && <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync Active</span>}
        {socketStatus === 'Reconnecting' && <span className="text-amber-500">Reconnecting...</span>}
        {socketStatus === 'Offline' && <span className="text-slate-400">Offline</span>}
      </div>

      <div className="flex items-center text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-slate-800 font-medium">{product.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex items-center justify-center bg-slate-50 rounded-xl p-8 border border-slate-100">
          <img src={product.image || 'https://placehold.co/400x400/ffffff/64748b?text=No+Image'} alt={product.name} className="max-w-full h-auto object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{product.name}</h1>
          <p className="text-lg text-slate-500 mb-6 border-b border-slate-100 pb-6">{product.brand}</p>
          
          <div className="flex items-end mb-6 gap-4">
            <div className="text-4xl font-bold text-slate-800">₹{product.sellingPrice}</div>
            {product.mrp > product.sellingPrice && (
              <div className="text-lg text-slate-400 line-through mb-1">MRP ₹{product.mrp}</div>
            )}
            {product.discountPercentage > 0 && (
              <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-2">
                {product.discountPercentage}% OFF
              </div>
            )}
          </div>

          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${product.stockQuantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Delivery Availability Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Deliver to {selectedAddress ? <span className="font-bold">{selectedAddress.pincode}</span> : 'Select a location in navbar'}
                </p>
                {selectedAddress && (
                  <div className={`mt-1 text-sm font-semibold flex items-center gap-1 ${deliveryAvailable ? 'text-success' : 'text-error'}`}>
                    {deliveryAvailable ? (
                      <><CheckCircle size={14} /> Delivery by {deliveryEstimate}</>
                    ) : (
                      '⚠ Not deliverable to this pincode'
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {cartItem ? (
                <div className="flex-1 flex items-center justify-between bg-white border-2 border-teal-600 text-teal-700 font-bold py-2 rounded-xl text-lg overflow-hidden">
                  <button 
                    onClick={() => {
                      if (cartItem.qty <= 1) removeFromCart(product._id);
                      else updateQuantity(product._id, cartItem.qty - 1);
                    }}
                    className="px-8 py-2 hover:bg-teal-50 transition-colors h-full"
                  >
                    −
                  </button>
                  <span className="text-xl">{cartItem.qty}</span>
                  <button 
                    onClick={() => {
                      if (cartItem.qty < (product.stockQuantity || 99)) {
                        updateQuantity(product._id, cartItem.qty + 1);
                      }
                    }}
                    className="px-8 py-2 hover:bg-teal-50 transition-colors h-full"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stockQuantity <= 0 || deliveryAvailable === false}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add To Cart'}
                </button>
              )}
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-2">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
