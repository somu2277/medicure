import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const HealthInsightsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const url = category ? `/articles?category=${category}` : '/articles';
        const res = await api.get(url);
        setArticles(res.data);
      } catch (err) {
        console.error('Failed to fetch articles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [category]);

  const categories = ['Mental Health', 'Nutrition', 'Wellness', 'Fitness'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">Health Insights & Blog</h1>
      
      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-full ${category === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setCategory('')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center">Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <img src={article.imageUrl || 'https://via.placeholder.com/800x400'} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{article.category}</span>
                  <span>{article.readingTime} min read</span>
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">{article.title}</h2>
                <p className="text-gray-600 mb-4 flex-grow">{article.excerpt}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-sm font-medium text-gray-900">{article.author}</span>
                  <Link to={/health-insights/} className="text-blue-600 hover:text-blue-800 font-medium">Read More &rarr;</Link>
                </div>
              </div>
            </div>
          ))}
          {articles.length === 0 && <div className="col-span-full text-center text-gray-500">No articles found.</div>}
        </div>
      )}
    </div>
  );
};

export default HealthInsightsPage;
