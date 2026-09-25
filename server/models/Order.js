const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true }, // Using string for product catalog ID
    productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    address: {
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    orderStatus: { 
        type: String, 
        enum: [
            'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PRESCRIPTION_VERIFICATION',
            'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED',
            'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'DELIVERY_FAILED', 'RETURNED', 'REFUNDED'
        ],
        default: 'PENDING_PAYMENT'
    },
    orderId: { type: String, unique: true },
    shipment: {
        courierName: String,
        trackingNumber: String,
        estimatedDeliveryDate: Date,
        shippedDate: Date,
        deliveredDate: Date
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String
    }],
    payment: {
        transactionId: String,
        method: String,
        gateway: String,
        amount: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);