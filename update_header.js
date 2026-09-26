const fs = require('fs');
let code = fs.readFileSync('client/src/components/Header.jsx', 'utf8');

code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { User, Percent, ShoppingCart, ChevronRight, ChevronDown, LogOut, MapPin, Package, Menu, X, Search } from 'lucide-react';");

// Insert mobile menu state
code = code.replace(/const \[isAddressModalOpen, setIsAddressModalOpen\] = useState\(false\);/, 'const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);');

// Close mobile menu on route change
code = code.replace(/useEffect\(\(\) => \{\n    if \(!userInfo\) return;/, 'useEffect(() => { setIsMobileMenuOpen(false); }, [window.location.pathname]);\n\n  useEffect(() => {\n    if (!userInfo) return;');

const desktopNav = `
      {/* Secondary Navigation Row (Desktop) */}
      <div 
        className="hidden md:block border-t border-b border-slate-200 bg-white shadow-sm relative"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
`;
code = code.replace(/\{\/\* Secondary Navigation Row \*\/\}\s*<div \s*className="border-t border-b border-slate-200 bg-white shadow-sm relative"\s*onMouseLeave=\{.*?\}\s*>/, desktopNav);

const mobileMenu = `
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
`;

code = code.replace(/\{\/\* Global Real-time Notification Toast \*\/\}/, mobileMenu + '\n      {/* Global Real-time Notification Toast */}');

const mobileToggle = `
        {/* Left Side: Logo and Location */}
        <div className="flex items-center gap-2 md:gap-6">
          <button className="md:hidden text-slate-700 p-1.5 -ml-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
`;

code = code.replace(/\{\/\* Left Side: Logo and Location \*\/\}\s*<div className="flex items-center gap-4 md:gap-6">/, mobileToggle);

fs.writeFileSync('client/src/components/Header.jsx', code);
