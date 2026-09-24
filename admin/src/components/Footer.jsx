import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded-md text-sm">MC</span>
              MediCare
            </h3>
            <p className="text-sm mb-4">Your trusted online pharmacy and healthcare platform. Get medicines delivered to your door.</p>
          </div>
          
          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/medicines" className="hover:text-white transition-colors">Order Medicines</Link></li>
              <li><Link to="/healthcare" className="hover:text-white transition-colors">Healthcare Products</Link></li>
              <li><Link to="/lab-tests" className="hover:text-white transition-colors">Lab Tests</Link></li>
              <li><Link to="/prescriptions/upload" className="hover:text-white transition-colors">Upload Prescription</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/personal-care" className="hover:text-white transition-colors">Personal Care</Link></li>
              <li><Link to="/category/vitamins" className="hover:text-white transition-colors">Vitamins & Supplements</Link></li>
              <li><Link to="/category/diabetes" className="hover:text-white transition-colors">Diabetes Care</Link></li>
              <li><Link to="/category/devices" className="hover:text-white transition-colors">Healthcare Devices</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help & Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/policies/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/policies/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; {new Date().getFullYear()} MediCare. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
