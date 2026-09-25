const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    house: { type: String, required: true }, // House/Flat number
    building: { type: String },
    street: { type: String },
    locality: { type: String, required: true }, // Area/Locality
    landmark: { type: String },
    city: { type: String, required: true },
    district: { type: String },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true, index: true },
    addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent multiple default addresses per user
addressSchema.pre('save', async function () {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
});

module.exports = mongoose.model('Address', addressSchema);
