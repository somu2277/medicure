const HealthArticle = require('../models/HealthArticle');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const { category, trending } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (trending === 'true') {
      query.isTrending = true;
    }
    
    const articles = await HealthArticle.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get article by ID
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = async (req, res) => {
  try {
    const article = await HealthArticle.findById(req.params.id).populate('relatedArticles', 'title excerpt imageUrl readingTime');
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getArticles,
  getArticleById
};
