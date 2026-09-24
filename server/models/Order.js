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
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    orderStatus: { 
        type: String, 
        enum: ['PLACED', 'PRESCRIPTION_REVIEW', 'CONFIRMED', 'PACKING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);