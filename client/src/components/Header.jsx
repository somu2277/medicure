import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Percent, ShoppingCart, ChevronRight, ChevronDown, LogOut } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import MegaMenu from './MegaMenu';

const Header = () => {
  const { cartItems } = useCartStore();
  const { userInfo, logout } = useAuthStore();
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');

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

  return (
    <header className="bg-white sticky top-0 z-50 relative">
      {/* Top Header Row */}
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left Side: Logo and Location */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Logo Section */}
          <Link to="/" className="flex flex-col justify-center flex-shrink-0">
            <span className="text-[10px] italic text-primary/80 font-medium leading-none mb-0.5 ml-6">Take it easy</span>
            <div className="flex items-center gap-1.5">
              <div className="bg-primary text-white font-bold text-lg px-1.5 py-0.5 rounded flex items-center justify-center" style={{borderRadius: '8px 0 8px 0'}}>MC</div>
              <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">MediCare</span>
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="hidden md:block h-8 w-px bg-slate-300"></div>

          {/* Deliver To */}
          <div className="hidden md:flex flex-col cursor-pointer">
            <span className="text-[11px] text-slate-500 leading-tight">Delivery to</span>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1 leading-tight">
              Select Location <ChevronRight size={14} className="text-slate-500 mt-0.5"/>
            </span>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
          
          {userInfo ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <User size={22} className="text-slate-600" />
                <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">Hello, {userInfo.name.split(' ')[0]}</span>
              </div>
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

      {/* Secondary Navigation Row */}
      <div 
        className="border-t border-b border-slate-200 bg-white shadow-sm relative"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
          <nav className="flex items-center md:justify-center gap-6 md:gap-8 text-[14px] font-medium text-slate-700 whitespace-nowrap min-w-max">
            
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

      {/* Global Real-time Notification Toast */}
      {notification && (
        <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium animate-pulse shadow-md z-50 relative">
          🔔 {notification}
        </div>
      )}
    </header>
  );
};

export default Header;
