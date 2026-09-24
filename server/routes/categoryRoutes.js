const express = require('express');
const router = express.Router();
const { Category, SubCategory, HealthConcern } = require('../models/Classification');

// @desc    Fetch all categories with subcategories
// @route   GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parentCategory',
                    as: 'subCategories'
                }
            }
        ]);
        res.json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Fetch subcategories for a category
// @route   GET /api/categories/:id/subcategories
router.get('/:id/subcategories', async (req, res) => {
    try {
        const subcategories = await SubCategory.find({ parentCategory: req.params.id });
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
