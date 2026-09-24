import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const MegaMenu = ({ isOpen, onMouseLeave }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const { data } = await api.get('/categories');
        const cats = data.categories || [];
        setCategories(cats);
        
        if (cats.length > 0) {
          setActiveCategory(cats[0].slug);
          
          // Organize subcategories by category
          const subMap = {};
          cats.forEach(cat => {
            if (cat.subCategories) {
              subMap[cat.slug] = [{
                title: cat.name,
                items: cat.subCategories
              }];
            }
          });
          setSubCategories(subMap);
        }
      } catch (err) {
        console.error('Failed to load menu data', err);
      }
    };
    fetchMenuData();
  }, []);

  if (!isOpen) return null;

  const currentSubcats = subCategories[activeCategory] || [];

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
              <li key={cat._id}>
                <button
                  onMouseEnter={() => setActiveCategory(cat.slug)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.slug 
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
                          to={`/category/${activeCategory}?sub=${item.slug}`}
                          className="text-[13px] text-slate-500 hover:text-primary transition-colors block leading-tight"
                        >
                          {item.name}
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
