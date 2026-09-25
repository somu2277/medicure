import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

// Dummy Data mapped to UI Design structure
const quickLinks = [
  { name: 'Medicine', offer: 'SAVE 27%', img: 'https://img.icons8.com/color/96/000000/pills.png' },
  { name: 'Lab Tests', offer: 'UPTO 70% OFF', img: 'https://img.icons8.com/color/96/000000/microscope.png' },
  { name: 'Doctor Consult', offer: 'FROM ₹199', img: 'https://img.icons8.com/color/96/000000/stethoscope.png' },
  { name: 'Branded Substitute', offer: 'UPTO 50% OFF', img: 'https://img.icons8.com/color/96/000000/replace.png' },
  { name: 'Healthcare', offer: 'UPTO 60% OFF', img: 'https://img.icons8.com/color/96/000000/medical-heart.png' },
  { name: 'Health Blogs', offer: '', img: 'https://img.icons8.com/color/96/000000/health-book.png', link: '/health-insights' },
  { name: 'PLUS', offer: 'Save 5% Extra', img: 'https://img.icons8.com/color/96/000000/plus-math.png' },
  { name: 'Offers', offer: '', img: 'https://img.icons8.com/color/96/000000/discount.png' },
  { name: 'Value Store', offer: 'UPTO 50% OFF', img: 'https://img.icons8.com/color/96/000000/shop.png' },
];

const labTestConcerns = [
  { name: 'Full Body Checkup', img: 'https://img.icons8.com/color/96/000000/body-scan.png' },
  { name: 'Vitamins', img: 'https://img.icons8.com/color/96/000000/pill.png' },
  { name: 'Diabetes', img: 'https://img.icons8.com/color/96/000000/sugar-cube.png' },
  { name: 'Fever', img: 'https://img.icons8.com/color/96/000000/thermometer.png' },
  { name: 'Thyroid', img: 'https://img.icons8.com/color/96/000000/throat.png' },
  { name: 'Heart', img: 'https://img.icons8.com/color/96/000000/heart-health.png' }
];

const mockDeals = [
  { _id: '1', name: 'Bontress Pro+ Scalp Serum', brand: 'Bontress', mrp: 1500, sellingPrice: 1410, discount: 6, image: 'https://img.icons8.com/color/144/000000/pills.png' },
  { _id: '2', name: 'Ahaglow Advanced Tube Of 200Gm', brand: 'Ahaglow', mrp: 798, sellingPrice: 743, discount: 7, image: 'https://img.icons8.com/color/144/000000/bandage.png' },
  { _id: '3', name: 'Conscious Chemist Blackhead Melting', brand: 'Conscious Chemist', mrp: 299, sellingPrice: 231, discount: 23, image: 'https://img.icons8.com/color/144/000000/syringe.png' },
  { _id: '4', name: 'Complan Nutritional Drink', brand: 'Complan', mrp: 309, sellingPrice: 300, discount: 3, image: 'https://img.icons8.com/color/144/000000/apple.png' },
  { _id: '5', name: 'Moov Pain Relief Specialist Tube', brand: 'Moov', mrp: 180, sellingPrice: 171, discount: 5, image: 'https://img.icons8.com/color/144/000000/bandage.png' },
];

const featuredBrands = [
  { name: 'Lineator', img: 'https://img.icons8.com/color/144/000000/pills.png' },
  { name: 'Biluma', img: 'https://img.icons8.com/color/144/000000/hospital.png' },
  { name: 'Oryza', img: 'https://img.icons8.com/color/144/000000/stethoscope.png' },
  { name: 'Ahaglow', img: 'https://img.icons8.com/color/144/000000/microscope.png' },
  { name: 'Nasoclear', img: 'https://img.icons8.com/color/144/000000/wheelchair.png' },
  { name: 'Obesigo', img: 'https://img.icons8.com/color/144/000000/doctor-female.png' },
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        
        {/* Top Search Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <h1 className="text-[28px] font-bold text-slate-800 mb-4 md:mb-0">What are you looking for?</h1>
          <Link to="/prescriptions/upload" className="flex items-center text-[13px] font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded border border-slate-200">
            <span className="mr-2 opacity-60">📄</span> Order with prescription. 
            <span className="text-teal-600 font-bold ml-2 flex items-center">UPLOAD NOW <ChevronRight size={14} className="ml-0.5" /></span>
          </Link>
        </div>

        {/* Main Search Bar */}
        <div className="relative mb-12">
          <form onSubmit={handleSearch} className="flex items-center border border-slate-200 rounded-full overflow-hidden shadow-sm h-[52px]">
            <div className="pl-4 pr-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for Shampoo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 outline-none text-[15px] text-slate-700 h-full placeholder:text-slate-400"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-full flex items-center justify-center font-bold text-[15px] transition-colors m-1 rounded-full">
              Search
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 mb-16 px-4 md:px-0 overflow-x-auto hide-scrollbar">
          {quickLinks.map((link, idx) => (
            <Link to={`/${link.name.toLowerCase().replace(' ', '-')}`} key={idx} className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
              <div className="w-[72px] h-[72px] mb-2 transition-transform hover:scale-105">
                <img src={link.img} alt={link.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-[14px] font-semibold text-slate-700 text-center leading-tight mb-1 whitespace-nowrap">{link.name}</span>
              {link.offer && (
                <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{link.offer}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Hero Banners */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x mb-16">
          <div className="min-w-[100%] md:min-w-[400px] h-[200px] rounded-2xl bg-gradient-to-r from-teal-900 to-teal-700 flex-shrink-0 snap-center relative overflow-hidden">
             <div className="p-8 relative z-10 w-2/3">
               <h2 className="text-white text-2xl font-bold mb-2">What's your gut<br/>trying to tell you?</h2>
               <button className="bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded mt-4">TAKE A SELF-ASSESSMENT</button>
             </div>
          </div>
          <div className="min-w-[100%] md:min-w-[400px] h-[200px] rounded-2xl bg-slate-800 flex-shrink-0 snap-center">
             <div className="p-8 relative z-10 w-2/3">
               <h2 className="text-white text-2xl font-bold mb-2">Physiotherapy at<br/>Home</h2>
               <button className="bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-2 rounded mt-4">Book FREE Consultation</button>
             </div>
          </div>
          <div className="min-w-[100%] md:min-w-[400px] h-[200px] rounded-2xl bg-teal-500 flex-shrink-0 snap-center">
             <div className="p-8 relative z-10 w-2/3">
               <h2 className="text-white text-2xl font-bold mb-2">The Rains Are Here.<br/>So Are Seasonal Fevers.</h2>
               <button className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded mt-4">BOOK NOW</button>
             </div>
          </div>
        </div>

        {/* Lab Tests by Health Concern */}
        <div className="mb-16">
          <h2 className="text-[22px] font-bold text-slate-800 mb-1">Lab Tests by Health Concern</h2>
          <p className="text-[13px] text-slate-500 mb-6 flex items-center">Powered by <span className="font-bold text-red-500 ml-1">Thyrocare</span></p>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {labTestConcerns.map((test, idx) => (
              <div key={idx} className="min-w-[150px] flex flex-col cursor-pointer group">
                <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100 group-hover:border-teal-500 transition-colors h-[150px] flex items-center justify-center">
                   <img src={test.img} alt={test.name} className="w-24 h-24 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[14px] font-medium text-slate-700 text-center">{test.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shop By Category */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-bold text-slate-800">Shop by Category</h2>
            <Link to="/healthcare" className="text-teal-600 font-bold text-[14px] flex items-center">View All <ChevronRight size={16} /></Link>
          </div>
          {categories.length === 0 ? (
            <div className="text-center text-slate-500 py-8">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat, idx) => (
                <Link to={`/category/${cat.slug}`} key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-full aspect-square bg-slate-50 rounded-xl p-6 mb-3 border border-slate-100 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-4xl text-teal-600">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-[14px] font-medium text-slate-700 text-center leading-tight group-hover:text-teal-600 transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Brands */}
        <div className="mb-16">
          <h2 className="text-[22px] font-bold text-slate-800 mb-2">Featured Brands</h2>
          <p className="text-[14px] text-slate-500 mb-6">Pick from our favourite brands</p>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
            {featuredBrands.map((brand, idx) => (
              <div key={idx} className="min-w-[150px] flex flex-col items-center cursor-pointer group">
                <div className="w-full aspect-square rounded-xl bg-slate-50 mb-3 border border-slate-100 overflow-hidden relative p-4 flex justify-center items-center">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <img src={brand.img} alt={brand.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[14px] font-medium text-slate-700 text-center">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deals of the Day */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[22px] font-bold text-slate-800">Deals of the Day</h2>
            <div className="bg-orange-400 text-white text-[12px] font-bold px-3 py-1 rounded flex items-center gap-1">
              <Clock size={14} /> 16:49 MINS LEFT, HURRY!
            </div>
            <Link to="/offers" className="text-teal-600 font-bold text-[14px] flex items-center ml-auto">View All <ChevronRight size={16} /></Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
            {mockDeals.map((deal) => (
              <div key={deal._id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start">
                <ProductCard product={deal} />
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-slate-50 rounded-2xl p-8 md:p-12 mb-16 border border-slate-100">
          <h2 className="text-[22px] font-bold text-slate-800 mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">👨‍👩‍👧‍👦</div>
              <div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-1">51 Million+</h4>
                <p className="text-[13px] text-slate-500">Registered users as of Aug 18, 2025</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-4xl">🛵</div>
              <div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-1">71 Million+</h4>
                <p className="text-[13px] text-slate-500">Orders on MediCare till date</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-4xl">💊</div>
              <div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-1">60000+</h4>
                <p className="text-[13px] text-slate-500">Unique items sold last 6 months</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-4xl">📍</div>
              <div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-1">19000+</h4>
                <p className="text-[13px] text-slate-500">Pin codes serviced last 3 months</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Text Footer block */}
        <div className="border-t border-slate-200 pt-12 pb-8">
           <h3 className="font-bold text-slate-800 mb-4">Your One-Stop Online Pharmacy - MediCare</h3>
           <h4 className="font-bold text-sm text-slate-700 mb-2">We've got India Covered!</h4>
           <p className="text-[12px] text-slate-500 mb-6 leading-relaxed">
             We now deliver in 1200+ cities and towns across 19000+ pin codes. We thereby cover every nook and corner of the country! The major cities in which we deliver include Mumbai, Kolkata, Delhi, Bengaluru, Ahmedabad, Hyderabad, Chennai, Thane, Howrah, Pune, Gurgaon, Navi Mumbai, Jaipur, Noida, Lucknow, Ghaziabad & Vadodara.
           </p>
           
           <h4 className="font-bold text-sm text-slate-700 mb-2">Say Goodbye to All Your Healthcare Worries With MediCare!</h4>
           <p className="text-[12px] text-slate-500 mb-6 leading-relaxed">
             MediCare is here to help you take it easy! We are amongst one of India's top online pharmacy and medical care platforms. It enables you to order pharmaceutical and healthcare products online by connecting you to registered retail pharmacies and get them delivered to your home. We are an online medical store, making your purchase easy, simple, and affordable!
           </p>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
