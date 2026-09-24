const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    category: { type: String, required: true }, 
    description: { type: String },
    composition: { type: String },
    strength: { type: String },
    dosageForm: { type: String },
    packSize: { type: String },
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    expiryDate: { type: Date },
    prescriptionRequired: { type: Boolean, default: false },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);