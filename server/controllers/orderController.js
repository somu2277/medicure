const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const {
            items,
            address,
            prescriptionId,
            subtotal,
            discount,
            deliveryFee,
            total,
            paymentStatus
        } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        const order = new Order({
            userId: req.user ? req.user._id : '64f0b2f5b5b0000000000001', // Mock ID for demo
            items,
            address,
            prescriptionId,
            subtotal,
            discount,
            deliveryFee,
            total,
            paymentStatus
        });

        const createdOrder = await order.save();

        // Deduct inventory
        for (const item of items) {
            await Product.findOneAndUpdate(
                { productId: item.productId },
                { $inc: { stockQuantity: -item.quantity, availableQuantity: -item.quantity } }
            );
        }

        // Notify admin
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('order:created', createdOrder);
        }

        res.status(201).json({ success: true, order: createdOrder });
    } catch (error) {
        console.error('ORDER CREATION ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders (Admin) or user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'CUSTOMER') {
            filter.userId = req.user._id;
        }

        const orders = await Order.find(filter)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('prescriptionId');

        if (order) {
            // Check if user is authorized to view this order
            if (req.user.role === 'CUSTOMER' && order.userId._id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
            res.json({ success: true, order });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const updatedOrder = await order.save();

        // Notify user about status change
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${order.userId}`).emit('order:statusChanged', updatedOrder);
        }

        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};
