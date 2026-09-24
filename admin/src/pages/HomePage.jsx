import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';

// Dummy Data mapped to UI Design structure
const quickLinks = [
  { name: 'Medicine', offer: 'SAVE 27%', img: 'https://cdn0.pharmeasy.in/webapp/images/medicine_ff.webp' },
  { name: 'Lab Tests', offer: 'UPTO 70% OFF', img: 'https://cdn0.pharmeasy.in/webapp/images/lab_tests_ff.webp' },
  { name: 'Doctor Consult', offer: 'FROM ₹199', img: 'https://cdn0.pharmeasy.in/webapp/images/healthcare_ff.webp' },
  { name: 'Branded Substitute', offer: 'UPTO 50% OFF', img: 'https://cdn0.pharmeasy.in/webapp/images/offers_1_ff.webp' },
  { name: 'Healthcare', offer: 'UPTO 60% OFF', img: 'https://cdn0.pharmeasy.in/webapp/images/offers_ff.webp' },
  { name: 'Health Blogs', offer: '', img: 'https://cdn0.pharmeasy.in/webapp/images/health_blog_ff.webp' },
  { name: 'PLUS', offer: 'Save 5% Extra', img: 'https://cdn0.pharmeasy.in/webapp/images/plus_ff.webp' },
  { name: 'Offers', offer: '', img: 'https://cdn0.pharmeasy.in/webapp/images/offers_1_ff.webp' },
  { name: 'Value Store', offer: 'UPTO 50% OFF', img: 'https://cdn0.pharmeasy.in/webapp/images/value_store_ff.webp' },
];

const labTestConcerns = [
  { name: 'Full Body Checkup', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/4cb2baf3234-Fullbody.png?dim=256x0' },
  { name: 'Vitamins', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/e1a18d8deac-Vitamins.png?dim=256x0' },
  { name: 'Diabetes', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/1e925df5743-Diabetes.png?dim=256x0' },
  { name: 'Fever', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/e1c60c444bf-Fever.png?dim=256x0' },
  { name: 'Thyroid', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/7b238cdbb60-w.png?dim=256x0' },
  { name: 'Heart', img: 'https://cms-contents.pharmeasy.in/homepage_top_categories_images/bca113a1b80-Bone.png?dim=256x0' }
];

const shopByCategory = [
  { name: 'Personal Care', img: 'https://cdn0.pharmeasy.in/category/images/3505abe418cb3e7f9a888c3a525433ce.jpeg?dim=256x0' },
  { name: 'Health Food and Drinks', img: 'https://cdn0.pharmeasy.in/category/images/c26428c0c45138bcacdf3a87bcad5b11.jpeg?dim=256x0' },
  { name: 'Vitamins & Supplements', img: 'https://cdn0.pharmeasy.in/category/images/e7dc270bc24b3cce981dc41c2106ff79.jpeg?dim=256x0' },
  { name: 'Healthcare Devices', img: 'https://cdn0.pharmeasy.in/category/images/f382a0b12bc1356bb012fce4d6b6bfdc.jpeg?dim=256x0' },
  { name: 'Homeopathy Care', img: 'https://cdn0.pharmeasy.in/category/images/13010b98ebc33dcfaee60ab0a4025178.jpeg?dim=256x0' },
  { name: 'Skin Care', img: 'https://cdn0.pharmeasy.in/category/images/944e8c56cc773e34bca4e6ec40b3c662.jpeg?dim=256x0' },
];

const mockDeals = [
  { _id: '1', name: 'Bontress Pro+ Scalp Serum', brand: 'Bontress', mrp: 1500, sellingPrice: 1410, discount: 6, image: 'https://cdn0.pharmeasy.in/images/product_images/1/33346b3f9ff7384ca4a544c4b63e8a4d.jpg?dim=700x0&dpr=1&q=100' },
  { _id: '2', name: 'Ahaglow Advanced Tube Of 200Gm', brand: 'Ahaglow', mrp: 798, sellingPrice: 743, discount: 7, image: 'https://cdn0.pharmeasy.in/images/product_images/1/c7c975a5cbff3c299281a8fbd74ce8ec.jpg?dim=700x0&dpr=1&q=100' },
  { _id: '3', name: 'Conscious Chemist Blackhead Melting', brand: 'Conscious Chemist', mrp: 299, sellingPrice: 231, discount: 23, image: 'https://cdn0.pharmeasy.in/images/product_images/1/36cdb0ef7f7d3cf2b63574c885bb3cb9.jpg?dim=700x0&dpr=1&q=100' },
  { _id: '4', name: 'Complan Nutritional Drink', brand: 'Complan', mrp: 309, sellingPrice: 300, discount: 3, image: 'https://cdn0.pharmeasy.in/images/product_images/1/88d6727de751386bb0bdfc2826cf5d50.jpg?dim=700x0&dpr=1&q=100' },
  { _id: '5', name: 'Moov Pain Relief Specialist Tube', brand: 'Moov', mrp: 180, sellingPrice: 171, discount: 5, image: 'https://cdn0.pharmeasy.in/images/product_images/1/b929e075c3db3617be3a25178652cc3b.jpg?dim=700x0&dpr=1&q=100' },
];

const featuredBrands = [
  { name: 'Lineator', img: 'https://cms-contents.pharmeasy.in/carousel_item/6ecfccce61c-Featured_brand_lineator.jpg?dim=146x0' },
  { name: 'Biluma', img: 'https://cms-contents.pharmeasy.in/carousel_item/1efdb0fba8c-Featured_brand_Biluma.jpg?dim=146x0' },
  { name: 'Oryza', img: 'https://cms-contents.pharmeasy.in/carousel_item/55f9db723db-Featured_brand_Oryza.jpg?dim=146x0' },
  { name: 'Ahaglow', img: 'https://cms-contents.pharmeasy.in/carousel_item/01dfa14ff7d-Featured_brand_Ahaglow.jpg?dim=146x0' },
  { name: 'Nasoclear', img: 'https://cms-contents.pharmeasy.in/carousel_item/b13a7c3cead-Featured_brand_Nasoclear.jpg?dim=146x0' },
  { name: 'Obesigo', img: 'https://cms-contents.pharmeasy.in/carousel_item/8b8e0b25db3-Featured_brand_Obesigo.jpg?dim=146x0' },
];

const HomePage = () => {
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
          <div className="flex items-center border border-slate-200 rounded-full overflow-hidden shadow-sm h-[52px]">
            <div className="pl-4 pr-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for Shampoo"
              className="w-full py-3 outline-none text-[15px] text-slate-700 h-full placeholder:text-slate-400"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-full flex items-center justify-center font-bold text-[15px] transition-colors m-1 rounded-full">
              Search
            </button>
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {shopByCategory.map((cat, idx) => (
              <Link to={`/category/${cat.name.toLowerCase().replace(' ', '-')}`} key={idx} className="flex flex-col items-center group cursor-pointer">
                <div className="w-full aspect-square bg-slate-50 rounded-xl p-6 mb-3 border border-slate-100 group-hover:border-teal-500 transition-colors">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[14px] font-medium text-slate-700 text-center leading-tight group-hover:text-teal-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
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
