const Product = require('../models/Product');
const { Category, SubCategory, HealthConcern } = require('../models/Classification');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const products = await Product.find({ ...keyword }).populate('categoryId subcategoryId healthConcernIds');
        res.json({ products, count: products.length });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId subcategoryId healthConcernIds');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        if (!productData.productId) {
            productData.productId = 'MED-' + Date.now();
        }
        // Sanitize empty strings for ObjectId fields
        if (productData.categoryId === '') delete productData.categoryId;
        if (productData.subcategoryId === '') delete productData.subcategoryId;

        const product = new Product(productData);
        const createdProduct = await product.save();
        req.app.get('io').emit('product:created', createdProduct);
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.categoryId === '') delete updateData.categoryId;
        if (updateData.subcategoryId === '') delete updateData.subcategoryId;

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (product) {
            req.app.get('io').emit('product:updated', product);
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete/Archive a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            req.app.get('io').emit('product:deleted', req.params.id);
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
