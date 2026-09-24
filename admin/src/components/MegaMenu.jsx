import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'must-haves', name: 'Health Must Haves' },
  { id: 'diabetes', name: 'Diabetes Essentials' },
  { id: 'personal-care', name: 'Personal Care' },
  { id: 'vitamins', name: 'Vitamins & Supplements' },
  { id: 'sexual-wellness', name: 'Sexual Wellness' },
  { id: 'sports', name: 'Sports Nutrition' },
  { id: 'devices', name: 'Healthcare Devices' },
  { id: 'pet-care', name: 'Pet Care' },
  { id: 'food-drinks', name: 'Health Food and Drinks' },
  { id: 'homeopathy', name: 'Homeopathy Care' },
  { id: 'ayurvedic', name: 'Ayurvedic Care' },
  { id: 'mother-baby', name: 'Mother and Baby Care' },
  { id: 'mobility', name: 'Mobility & Elderly Care' },
  { id: 'health-concern', name: 'Health Concern' },
  { id: 'skin-care', name: 'Skin Care' },
  { id: 'monsoon', name: 'Monsoon Store' }
];

const subcategoriesData = {
  'diabetes': [
    { title: 'Diabetic Care OTC Products', items: ['All Diabetic Care OTC Products'] },
    { title: 'Glucometer & Test Strips', items: ['All Glucometer & Test Strips', 'Glucometer Test Strips', 'Glucometer', 'Lancets & Accessories', 'Continuous Glucose Monitoring'] },
    { title: 'Diabetic Supplements', items: ['All Diabetic Supplements'] },
    { title: 'Juices & Vinegars', items: ['All Juices & Vinegars'] },
    { title: 'Sugar Substitutes', items: ['All Sugar Substitutes'] }
  ],
  'personal-care': [
    { title: 'Hair Care Products', items: ['All Hair Care Products', 'Hair Care Products'] },
    { title: 'Face Care Products', items: ['All Face Care Products', 'Face Cleansers', 'Lip Care Products', 'Face Wash', 'Face Toners & Mists', 'Facial Kits', 'Moisturizers', 'Eye Care Products', 'Face Masks & Protective Masks', 'Sunscreen', 'Talcum Powder', 'Face Scrubs', 'Face Wipes'] },
    { title: 'Women Care Products', items: ['All Women Care Products', 'Sexual Wellness Products', 'Mother Care Products', 'Intimate Care & Hygiene Products'] },
    { title: 'Male Grooming Products', items: ['All Male Grooming Products', 'Beard Care Products', 'Face Care Products', 'Body Care Products'] },
    { title: 'Healthcare Appliances', items: ['All Healthcare Appliances', 'Massagers', 'Hair Styling Products', 'Beard Grooming Products', 'Hair & Beard Trimmers'] },
    { title: 'Skin Care Products', items: ['All Skin Care Products'] },
    { title: 'Men Care Products', items: ['All Men Care Products', 'Men\'s Wellness Essentials'] },
    { title: 'Oral Care Products', items: ['All Oral Care Products', 'Toothpaste', 'Mouth Wash', 'Tooth Powder', 'Toothbrush'] },
    { title: 'Body Care Products', items: ['All Body Care Products', 'Deodorants', 'Soaps', 'Massage Oils', 'Body Lotion & Cream', 'Body Wash & Shower Gels', 'Body Talc', 'Body Scrubs', 'Anti Stretch Marks Products'] },
    { title: 'Hands & Feet Care Products', items: ['All Hands & Feet Care Products', 'Body Scrubs', 'Body Lotions', 'Hand Wash'] }
  ],
  'vitamins': [
    { title: 'Vitamins and Supplements', items: ['All Vitamins and Supplements'] },
    { title: 'Biotin Supplements', items: ['All Biotin Supplements'] },
    { title: 'Health Gummies', items: ['All Health Gummies'] },
    { title: 'Sleep Support Supplements', items: ['All Sleep Support Supplements'] },
    { title: 'Vitamins & Supplements for Diabetes', items: ['All Vitamins & Supplements for Diabetes'] },
    { title: 'Multivitamins', items: ['All Multivitamins'] },
    { title: 'Collagen Supplements', items: ['All Collagen Supplements'] },
    { title: 'Skin Health Supplements', items: ['All Skin Health Supplements'] },
    { title: 'Vitamins & Supplements for Heart', items: ['All Vitamins & Supplements for Heart'] }
  ]
};

const MegaMenu = ({ isOpen, onMouseLeave }) => {
  const [activeCategory, setActiveCategory] = useState(categories[2].id); // Default to Personal Care for visual

  if (!isOpen) return null;

  const currentSubcats = subcategoriesData[activeCategory] || [];

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 z-50 flex h-[500px]"
      onMouseLeave={onMouseLeave}
    >
      <div className="container mx-auto flex h-full">
        {/* Left Sidebar - Categories */}
        <div className="w-[280px] border-r border-slate-200 bg-slate-50 overflow-y-auto hide-scrollbar py-4">
          <ul className="flex flex-col gap-1 px-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-slate-200/70 font-semibold text-slate-900 relative after:content-[""] after:absolute after:right-[-12px] after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-l-slate-200/70' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content - Subcategories */}
        <div className="flex-1 bg-white overflow-y-auto hide-scrollbar p-8">
          {currentSubcats.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
              {currentSubcats.map((group, idx) => (
                <div key={idx} className="break-inside-avoid mb-8 inline-block w-full">
                  <h3 className="font-bold text-slate-800 text-[15px] mb-3">{group.title}</h3>
                  <ul className="flex flex-col gap-2.5">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link 
                          to={`/healthcare/${activeCategory}?sub=${encodeURIComponent(item)}`}
                          className="text-[13px] text-slate-500 hover:text-primary transition-colors block leading-tight"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a category to view subcategories
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
