import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useCartStore from '../store/cartStore';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCartStore();
  const cartItem = cartItems.find(item => item._id === product._id);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      <Link to={`/product/${product._id}`} className="relative p-4 flex justify-center items-center h-40 md:h-48 bg-slate-50 flex-shrink-0 cursor-pointer">
        {product.image ? (
          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">Img</div>
        )}
        
        {product.prescriptionRequired && (
          <span className="absolute top-2 left-2 bg-warning text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            Rx Required
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-error text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm">
            {product.discount}% OFF
          </span>
        )}
      </Link>
      
      <div className="p-3 md:p-4 border-t border-slate-100 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`} className="hover:text-primary">
          <h3 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-2 mb-1" title={product.name}>
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mb-2 mt-auto">{product.brand}</p>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base md:text-lg font-bold text-slate-900">₹{product.sellingPrice}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs md:text-sm text-slate-400 line-through">₹{product.mrp}</span>
          )}
        </div>
        
        {cartItem ? (
          <div className="w-full mt-auto flex items-center justify-between bg-white border border-primary text-primary font-medium py-1 md:py-1.5 rounded text-sm overflow-hidden">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cartItem.qty <= 1) removeFromCart(product._id);
                else updateQuantity(product._id, cartItem.qty - 1);
              }}
              className="px-4 py-1 hover:bg-primary/10 transition-colors h-full"
            >
              −
            </button>
            <span className="font-bold">{cartItem.qty}</span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cartItem.qty < (product.stock || 99)) {
                  updateQuantity(product._id, cartItem.qty + 1);
                }
              }}
              className="px-4 py-1 hover:bg-primary/10 transition-colors h-full"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={product.stock === 0}
            className="w-full mt-auto flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium py-1.5 md:py-2 px-4 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
