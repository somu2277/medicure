const mongoose = require('mongoose');

const healthArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  readingTime: {
    type: Number,
    required: true,
  },
  tags: [String],
  isTrending: {
    type: Boolean,
    default: false,
  },
  relatedArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthArticle'
    }
  ]
}, { timestamps: true });

const HealthArticle = mongoose.model('HealthArticle', healthArticleSchema);

module.exports = HealthArticle;
