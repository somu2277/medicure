const sendEmail = require('../utils/sendEmail');
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

        // Generate Unique Order ID (e.g., MED-2026-000123)
        const date = new Date();
        const year = date.getFullYear();
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
        const orderId = `MED-${year}-${randomNum}`;

        const initialStatus = paymentStatus === 'PAID' ? 'PAYMENT_CONFIRMED' : 'PENDING_PAYMENT';

        const order = new Order({
            userId: req.user._id,
            orderId,
            items,
            address,
            prescriptionId,
            subtotal,
            discount,
            deliveryFee,
            total,
            paymentStatus,
            orderStatus: initialStatus,
            statusHistory: [{
                status: initialStatus,
                timestamp: Date.now(),
                updatedBy: req.user ? req.user._id : null,
                notes: 'Order placed successfully'
            }]
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
        const { orderStatus, paymentStatus, shipment } = req.body;
        const order = await Order.findById(req.params.id).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let statusChanged = false;
        let emailSubject = '';
        let statusMessage = '';
        
        const oldOrderStatus = order.orderStatus;
        const oldPaymentStatus = order.paymentStatus;
        const oldShipment = { ...order.shipment?.toObject?.() || order.shipment };

        if (orderStatus && order.orderStatus !== orderStatus) {
            order.orderStatus = orderStatus;
            order.statusHistory.push({
                status: orderStatus,
                timestamp: Date.now(),
                updatedBy: req.user ? req.user._id : null,
                notes: `Order status updated to ${orderStatus}`
            });
            statusChanged = true;
            
            if (orderStatus === 'SHIPPED') order.shipment.shippedDate = Date.now();
            if (orderStatus === 'DELIVERED') order.shipment.deliveredDate = Date.now();
            
            if (orderStatus === 'CONFIRMED') {
                emailSubject = `Order Confirmed - MediCare Order ${order.orderId || order._id}`;
                statusMessage = 'Your order has been confirmed and is being prepared.';
            } else if (orderStatus === 'PACKED') {
                emailSubject = `Order Packed - MediCare Order ${order.orderId || order._id}`;
                statusMessage = 'Your medicine order has been packed and is ready for dispatch.';
            } else if (orderStatus === 'SHIPPED') {
                emailSubject = `Your MediCare Order Has Been Shipped - ${order.orderId || order._id}`;
                statusMessage = 'Your order has been shipped!';
            } else if (orderStatus === 'OUT_FOR_DELIVERY') {
                emailSubject = `MediCare Delivery Update - ${order.orderId || order._id}`;
                statusMessage = 'Your order is out for delivery today.';
            } else if (orderStatus === 'DELIVERED') {
                emailSubject = `Order Delivered - MediCare Order ${order.orderId || order._id}`;
                statusMessage = 'Your order has been successfully delivered.';
            } else if (orderStatus === 'CANCELLED') {
                emailSubject = `Order Cancelled - MediCare Order ${order.orderId || order._id}`;
                statusMessage = 'Your order has been cancelled.';
            }
        }
        
        if (paymentStatus && order.paymentStatus !== paymentStatus) {
            order.paymentStatus = paymentStatus;
            statusChanged = true;
            
            if (!emailSubject) {
                emailSubject = `Payment Update - MediCare Order ${order.orderId || order._id}`;
                if (paymentStatus === 'PAID') statusMessage = `Payment of ₹${order.total} verified as PAID.`;
                else if (paymentStatus === 'FAILED') statusMessage = 'Your recent payment was unsuccessful. Please retry payment.';
                else if (paymentStatus === 'REFUNDED') statusMessage = 'A refund for your order has been initiated/completed.';
            }
        }

        if (shipment) {
            if (shipment.courierName !== oldShipment.courierName || 
                shipment.trackingNumber !== oldShipment.trackingNumber || 
                shipment.estimatedDeliveryDate !== oldShipment.estimatedDeliveryDate) {
                statusChanged = true;
                
                if (!emailSubject) {
                    emailSubject = `MediCare Delivery Update - ${order.orderId || order._id}`;
                    statusMessage = 'Your delivery and tracking information has been updated.';
                }
            }
            order.shipment = { ...order.shipment?.toObject?.() || {}, ...shipment };
        }

        const updatedOrder = await order.save();

        let emailSent = false;
        let emailError = null;

        if (statusChanged && emailSubject && order.userId?.email) {
            // Build Email HTML
            let trackingSection = '';
            if (order.shipment?.trackingNumber) {
                trackingSection = `
                    <div style="background:#f8fafc; padding:15px; margin: 15px 0; border-radius:8px;">
                        <h4 style="margin:0 0 10px 0; color:#334155;">Tracking Information</h4>
                        <p style="margin:5px 0;"><strong>Courier:</strong> ${order.shipment.courierName || 'Not specified'}</p>
                        <p style="margin:5px 0;"><strong>Tracking No:</strong> ${order.shipment.trackingNumber}</p>
                        ${order.shipment.estimatedDeliveryDate ? `<p style="margin:5px 0;"><strong>Estimated Delivery:</strong> ${new Date(order.shipment.estimatedDeliveryDate).toLocaleDateString()}</p>` : ''}
                    </div>
                `;
            } else if (order.shipment?.estimatedDeliveryDate) {
                trackingSection = `<p><strong>Estimated Delivery:</strong> ${new Date(order.shipment.estimatedDeliveryDate).toLocaleDateString()}</p>`;
            }

            const itemsList = order.items.map(item => 
                `<li>${item.name} - Qty: ${item.quantity} - ₹${item.price}</li>`
            ).join('');

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d9488;">MediCare Pharmacy</h2>
                    <p>Dear ${order.userId.name},</p>
                    <p><strong>${statusMessage}</strong></p>
                    
                    <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${order.orderId || order._id}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.orderStatus}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                        <p><strong>Total:</strong> ₹${order.total}</p>
                        
                        <h4 style="margin-bottom: 5px;">Items:</h4>
                        <ul style="margin-top: 0;">
                            ${itemsList}
                        </ul>
                        
                        <h4 style="margin-bottom: 5px;">Delivery Address:</h4>
                        <p style="margin-top: 0;">
                            ${order.address?.addressLine || ''}<br>
                            ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pincode || ''}
                        </p>
                    </div>

                    ${trackingSection}

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/my-orders" style="background: #0d9488; color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold;">Track My Order</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                        Last updated: ${new Date().toLocaleString()}<br>
                        Thank you for choosing MediCare!
                    </p>
                </div>
            `;

            try {
                await sendEmail({
                    email: order.userId.email,
                    subject: emailSubject,
                    message: `${statusMessage} - Track at http://localhost:5173/my-orders`,
                    html: emailHtml
                });
                emailSent = true;
            } catch (err) {
                console.error('Email sending failed:', err);
                emailError = err.message;
            }
        }

        // Notify user via Socket
        const io = req.app.get('io');
        if (io && statusChanged) {
            io.to(`user_${order.userId._id}`).emit('order:statusChanged', updatedOrder);
        }
        
        let message = 'Order updated successfully. No relevant changes to notify.';
        if (statusChanged && emailSent) message = 'Order updated and customer email sent.';
        else if (statusChanged && !emailSent && emailSubject) message = 'Order updated successfully, but the customer email could not be sent. Retry notification.';

        res.json({ 
            success: true, 
            order: updatedOrder,
            emailSent,
            message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};
