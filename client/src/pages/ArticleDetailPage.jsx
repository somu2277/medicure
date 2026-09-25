import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/articles/${id}`);
        setArticle(res.data);
      } catch (err) {
        console.error('Failed to fetch article', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading article...</div>;
  if (!article) return <div className="text-center py-20">Article not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/health-insights" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Insights</Link>
      
      <div className="mb-8">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{article.category}</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-gray-900">{article.title}</h1>
        <div className="flex items-center text-gray-600 space-x-4">
          <span className="font-medium">{article.author}</span>
          <span>&bull;</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          <span>&bull;</span>
          <span>{article.readingTime} min read</span>
        </div>
      </div>

      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-96 object-cover rounded-xl mb-8" />
      )}

      <div className="prose prose-lg max-w-none mb-12">
        {article.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-800 leading-relaxed">{paragraph}</p>
        ))}
      </div>

      <div className="border-t pt-8">
        <h3 className="text-2xl font-bold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#{tag}</span>
          ))}
        </div>
      </div>
      
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {article.relatedArticles.map(related => (
              <Link to={/health-insights/} key={related._id} className="block group">
                <div className="border rounded-lg overflow-hidden flex items-center p-4 hover:shadow-md transition">
                  {related.imageUrl && (
                    <img src={related.imageUrl} alt={related.title} className="w-24 h-24 object-cover rounded mr-4" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-blue-600 transition">{related.title}</h4>
                    <span className="text-sm text-gray-500">{related.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;
