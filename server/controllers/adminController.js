const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({ stockQuantity: { $lt: 20 } });
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

        // Get Recent Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Get Low Stock Alerts
        const lowStockAlerts = await Product.find({ stockQuantity: { $lt: 20 } })
            .select('name stockQuantity')
            .limit(5);

        res.json({
            stats: {
                totalProducts,
                lowStockProducts,
                totalOrders,
                totalCustomers
            },
            recentOrders,
            lowStockAlerts
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get All Customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, customers });
    } catch (error) {
        console.error('Fetch Customers Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Customer Details with Order History
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
const getCustomerDetails = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-passwordHash -otp -resetPasswordToken');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const orders = await Order.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name images price');

        res.json({ success: true, customer, orders });
    } catch (error) {
        console.error('Fetch Customer Details Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getDashboardStats, getCustomers, getCustomerDetails };
