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

// @desc    Create a category
// @route   POST /api/categories
router.post('/', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const category = await Category.create({ name, slug: slug || name.toLowerCase().replace(/ /g, '-') });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, slug: slug || name.toLowerCase().replace(/ /g, '-') },
            { new: true }
        );
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        await SubCategory.deleteMany({ parentCategory: req.params.id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a subcategory
// @route   POST /api/categories/:id/subcategories
router.post('/:id/subcategories', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const subCategory = await SubCategory.create({ 
            name, 
            slug: slug || name.toLowerCase().replace(/ /g, '-'),
            parentCategory: req.params.id
        });
        res.status(201).json(subCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
