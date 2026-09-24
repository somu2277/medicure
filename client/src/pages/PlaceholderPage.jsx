import React from 'react';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.substring(1).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
        <Construction size={64} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{pageName || 'Page'} Coming Soon</h2>
      <p className="text-slate-500 text-center max-w-md">
        We are working hard to bring you the best {pageName} experience. Please check back later.
      </p>
    </div>
  );
};

export default PlaceholderPage;
