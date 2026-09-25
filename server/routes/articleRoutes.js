const express = require('express');
const router = express.Router();
const { getArticles, getArticleById } = require('../controllers/articleController');

router.route('/').get(getArticles);
router.route('/:id').get(getArticleById);

module.exports = router;
