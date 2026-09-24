const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  slug: { type: String, unique: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  image: { type: String },
  slug: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// Ensure subcategories are unique within a parent category
subCategorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

const healthConcernSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  slug: { type: String, unique: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const HealthConcern = mongoose.model('HealthConcern', healthConcernSchema);

module.exports = { Category, SubCategory, HealthConcern };
