import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../utils/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSubcat, setActiveSubcat] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const catsRes = await api.get('/categories');
        const currentCat = catsRes.data.categories?.find(c => c.slug === slug);
        
        if (currentCat) {
          setCategory(currentCat);
          setSubcategories(currentCat.subCategories || []);
          
          const prodsRes = await api.get('/products');
          const allProds = prodsRes.data.products || [];
          const filtered = allProds.filter(p => p.categoryId && p.categoryId._id === currentCat._id);
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchCategoryData();
    }

    // Real-time socket updates
    import('../utils/socket').then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      
      const handleProductUpdate = () => {
        // Refetch to get updated prices, stock, or new category mappings
        fetchCategoryData();
      };

      socket.on('product:updated', handleProductUpdate);
      socket.on('product:created', handleProductUpdate);
      socket.on('product:archived', handleProductUpdate);
      socket.on('category:updated', handleProductUpdate);

      return () => {
        socket.off('product:updated', handleProductUpdate);
        socket.off('product:created', handleProductUpdate);
        socket.off('product:archived', handleProductUpdate);
        socket.off('category:updated', handleProductUpdate);
      };
    });
  }, [slug]);

  const displayedProducts = activeSubcat
    ? products.filter(p => p.subcategoryId && p.subcategoryId._id === activeSubcat._id)
    : products;

  if (loading) return <div className="p-12 text-center text-slate-500">Loading category data...</div>;
  
  if (!category) return <div className="p-12 text-center text-slate-500">Category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/categories" className="hover:text-primary transition-colors">Healthcare</Link>
        <ChevronRight size={16} className="mx-2" />
        {activeSubcat ? (
          <>
            <button onClick={() => setActiveSubcat(null)} className="hover:text-primary transition-colors">{category.name}</button>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-slate-800 font-medium">{activeSubcat.name}</span>
          </>
        ) : (
          <span className="text-slate-800 font-medium">{category.name}</span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{category.name}</h1>
        <p className="text-slate-500 mb-6">{displayedProducts.length} Products Available</p>
        
        {subcategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {subcategories.map(sub => (
              <span key={sub._id} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                {sub.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No products found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map(product => (
            <Link key={product._id} to={`/product/${product._id}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-4 flex items-center justify-center h-48 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-slate-300 text-xs">No img</div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{product.brand}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">₹{product.sellingPrice}</span>
                    {product.mrp > product.sellingPrice && <span className="text-xs text-slate-400 line-through ml-2">₹{product.mrp}</span>}
                  </div>
                  <button className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors">
                    ADD
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
