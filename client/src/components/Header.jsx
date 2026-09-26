import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Percent, ShoppingCart, ChevronRight, ChevronDown, LogOut, MapPin, Package, Menu, X, Search } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useAddressStore from '../store/addressStore';
import MegaMenu from './MegaMenu';
import AddressModal from './AddressModal';

const Header = () => {
  const { cartItems } = useCartStore();
  const { userInfo, logout } = useAuthStore();
  const { selectedAddress, fetchAddresses, deliveryAvailable } = useAddressStore();
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      fetchAddresses();
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;

    import('../utils/socket').then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      
      // Join personal room to receive private order updates
      socket.emit('join_user_room', userInfo._id);

      const handleOrderUpdate = (order) => {
        setNotification(`Order #${order._id.substring(18,24).toUpperCase()} is now ${order.orderStatus}!`);
        setTimeout(() => setNotification(''), 8000);
      };

      socket.on('order:statusChanged', handleOrderUpdate);

      return () => {
        socket.off('order:statusChanged', handleOrderUpdate);
      };
    });
  }, [userInfo]);

  const displayLocation = userInfo && selectedAddress 
    ? `${selectedAddress.pincode}, ${selectedAddress.city}`
    : 'Select Location';

  return (
    <header className="bg-white sticky top-0 z-50 relative">
      {/* Top Header Row */}
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        
        
        {/* Left Side: Logo and Location */}
        <div className="flex items-center gap-2 md:gap-6">
          <button className="md:hidden text-slate-700 p-1.5 -ml-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center flex-shrink-0">
            <img src="https://logoarena-storage.s3.amazonaws.com/contests/public/6154/961_1438568522_medicure.jpg" alt="MediCare Logo" className="h-10 md:h-12 mix-blend-multiply object-contain" />
          </Link>

          {/* Vertical Divider */}
          <div className="hidden md:block h-8 w-px bg-slate-300"></div>

          {/* Deliver To */}
          <div 
            className="hidden md:flex flex-col cursor-pointer group"
            onClick={() => setIsAddressModalOpen(true)}
            title="Choose delivery address"
          >
            <span className="text-[11px] text-slate-500 leading-tight">Delivery to</span>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1 leading-tight group-hover:text-primary transition-colors">
                <>
                  <span className="truncate max-w-[150px]">{displayLocation}</span> 
                  <ChevronRight size={14} className="text-slate-500 mt-0.5 group-hover:text-primary"/>
                </>
            </span>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
          
          {userInfo ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors cursor-pointer">
                <User size={22} className="text-slate-600" />
                <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">Hello, {userInfo.name.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors cursor-pointer relative">
              <User size={22} className="text-slate-600" />
              <span className="hidden md:block text-sm font-medium">Hello, Log in</span>
              <span className="absolute top-0 right-0 md:right-auto md:-top-1 md:-right-2 bg-error w-1.5 h-1.5 rounded-full"></span>
            </Link>
          )}
          
          {userInfo && (
            <Link to="/my-orders" className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-primary transition-colors cursor-pointer">
              <Package size={22} className="text-slate-600" />
              <span className="hidden md:block text-sm font-medium">Orders</span>
            </Link>
          )}
          
          <Link to="/offers" className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-primary transition-colors cursor-pointer">
            <Percent size={22} className="text-slate-600" />
            <span className="hidden md:block text-sm font-medium">Offers</span>
          </Link>
          
          <Link to="/cart" className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors relative">
            <div className="relative">
              <ShoppingCart size={22} className="text-slate-600" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden md:block text-sm font-medium">Cart</span>
          </Link>

        </div>
      </div>

      
      {/* Secondary Navigation Row (Desktop) */}
      <div 
        className="hidden md:block border-t border-b border-slate-200 bg-white shadow-sm relative"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
          <nav className="flex items-center md:justify-center gap-6 md:gap-8 text-[14px] font-medium text-slate-700 whitespace-nowrap min-w-max">
            
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3">
              Home
            </Link>
            
            <Link to="/medicines" className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3">
              Medicine <ChevronDown size={14} className="text-slate-400"/>
            </Link>
            
            <div 
              className={`hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3 border-b-2 ${isMegaMenuOpen ? 'border-primary text-primary' : 'border-transparent'}`}
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onClick={() => setIsMegaMenuOpen(true)}
            >
              Healthcare <ChevronDown size={14} className={isMegaMenuOpen ? 'text-primary' : 'text-slate-400'}/>
            </div>
            
            <Link to="/doctors" className="hover:text-primary transition-colors cursor-pointer py-3">
              Doctor Consult
            </Link>
            
            <Link to="/lab-tests" className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3">
              Lab Tests <ChevronDown size={14} className="text-slate-400"/>
            </Link>
            
            <Link to="/plus" className="hover:text-primary transition-colors cursor-pointer py-3">
              PLUS
            </Link>
            
            <Link to="/health-blogs" className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer py-3">
              Health Insights <ChevronDown size={14} className="text-slate-400"/>
            </Link>
            
            <Link to="/offers" className="hover:text-primary transition-colors cursor-pointer py-3">
              Offers
            </Link>
            
            <Link to="/ask-easy" className="hover:text-primary transition-colors cursor-pointer py-3">
              AskEasy
            </Link>

          </nav>
        </div>
        
        {/* Mega Menu Overlay Layer */}
        <MegaMenu isOpen={isMegaMenuOpen} onMouseLeave={() => setIsMegaMenuOpen(false)} />
      </div>

      
      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-primary text-white">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-primary-dark rounded"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-slate-700">
              {userInfo && (
                <div className="border-b border-slate-200 pb-4 mb-2">
                  <div className="font-bold text-lg mb-1 truncate">{userInfo.name}</div>
                  <div className="text-sm text-slate-500 truncate">{userInfo.email}</div>
                  <div className="mt-4 flex gap-3">
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-slate-100 text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">Profile</Link>
                    <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-slate-100 text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">Orders</Link>
                  </div>
                </div>
              )}
              
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Home</Link>
              <Link to="/medicines" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Medicine</Link>
              <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Doctor Consult</Link>
              <Link to="/lab-tests" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Lab Tests</Link>
              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Offers</Link>
              <Link to="/health-blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-2 font-medium hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50">Health Insights</Link>
              
              <div className="mt-auto pt-6 pb-2">
                  {!userInfo ? (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-primary text-white text-center py-3.5 rounded-xl font-bold shadow-md shadow-primary/20">Log In / Sign Up</Link>
                  ) : (
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-red-50 text-red-600 text-center py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"><LogOut size={18}/> Log Out</button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Real-time Notification Toast */}
      {notification && (
        <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium animate-pulse shadow-md z-50 relative">
          🔔 {notification}
        </div>
      )}

      {/* Delivery Address Modal */}
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </header>
  );
};

export default Header;
