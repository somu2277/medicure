const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Info
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  genericName: { type: String },
  brand: { type: String, required: true },
  manufacturer: { type: String },
  sku: { type: String, unique: true },
  barcode: { type: String },
  
  // Classification
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  healthConcernIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthConcern' }],
  productType: { type: String, enum: ['Medicine', 'Healthcare', 'Device', 'Supplement'] },
  
  // Medicine specific
  medicineClass: { type: String },
  molecule: { type: String },
  composition: { type: String },
  activeIngredients: [{ type: String }],
  strength: { type: String },
  dosageForm: { type: String },
  routeOfAdministration: { type: String },
  
  // Packaging
  packSize: { type: String },
  unit: { type: String },
  
  // Commercial
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  
  // Prescription
  prescriptionRequired: { type: Boolean, default: false },
  scheduleType: { type: String },
  
  // Content
  description: { type: String },
  shortDescription: { type: String },
  uses: { type: String },
  warnings: { type: String },
  contraindications: { type: String },
  storageInstructions: { type: String },
  ageRestriction: { type: String },
  
  // Images
  image: { type: String }, // URL or path
  thumbnail: { type: String },
  gallery: [{ type: String }],
  brandLogo: { type: String },
  
  // Metrics
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Inventory
  stockQuantity: { type: Number, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  
  // Expiry
  expiryDate: { type: Date },
  batchNumber: { type: String },
  manufacturingDate: { type: Date },
  
  // Flags
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewLaunch: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  
  // Data Origin Tracking
  dataType: { type: String, default: 'demo' },
  dataSource: { type: String },
  sourceUrl: { type: String },
  sourceIdentifier: { type: String },
  dataLastUpdated: { type: Date },

  status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' }
}, {
  timestamps: true
});

// Middleware to calculate discount and available quantity before saving
productSchema.pre('save', function(next) {
  if (this.mrp && this.sellingPrice) {
    this.discountPercentage = Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
  }
  
  this.availableQuantity = this.stockQuantity - this.reservedQuantity;
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
