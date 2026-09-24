require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { Category, SubCategory, HealthConcern } = require('../models/Classification');

async function validateData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Validation.');

        const products = await Product.find({});
        const categories = await Category.find({});
        const subcategories = await SubCategory.find({});
        const healthConcerns = await HealthConcern.find({});

        let errors = 0;
        let warnings = 0;

        console.log('\n--- Running Dataset Validation ---\n');

        // 1. Initial 60 products requirement (40 med + 20 hc)
        if (products.length !== 60) {
            console.error(`❌ ERROR: Expected exactly 60 products. Found ${products.length}.`);
            errors++;
        } else {
            console.log(`✅ Success: Exactly 60 products found.`);
        }

        // 2. Unique productId
        const productIds = new Set();
        products.forEach(p => {
            if (productIds.has(p.productId)) {
                console.error(`❌ ERROR: Duplicate productId found - ${p.productId}`);
                errors++;
            }
            productIds.add(p.productId);
        });

        // 3. Valid Category and Subcategory references
        const categoryIds = new Set(categories.map(c => c._id.toString()));
        const subcategoryIds = new Set(subcategories.map(s => s._id.toString()));

        products.forEach(p => {
            if (!p.categoryId) {
                console.warn(`⚠️ WARNING: Product ${p.productId} has no categoryId.`);
                warnings++;
            } else if (!categoryIds.has(p.categoryId.toString())) {
                console.error(`❌ ERROR: Product ${p.productId} references invalid categoryId: ${p.categoryId}`);
                errors++;
            }

            if (p.subcategoryId && !subcategoryIds.has(p.subcategoryId.toString())) {
                console.error(`❌ ERROR: Product ${p.productId} references invalid subcategoryId: ${p.subcategoryId}`);
                errors++;
            }
        });
        
        console.log(`✅ Success: Category and Subcategory relations validated.`);

        // 4. Orphan Subcategories
        subcategories.forEach(sub => {
            if (!sub.parentCategory || !categoryIds.has(sub.parentCategory.toString())) {
                console.error(`❌ ERROR: Orphan subcategory found - ${sub.name} (No valid parent category)`);
                errors++;
            }
        });

        console.log(`✅ Success: No orphan subcategories detected.`);

        console.log('\n--- Validation Complete ---');
        console.log(`Errors: ${errors}`);
        console.log(`Warnings: ${warnings}`);

        if (errors > 0) {
            console.error('\n🚨 VALIDATION FAILED. Fix errors before proceeding.');
            process.exit(1);
        } else {
            console.log('\n🌟 VALIDATION PASSED.');
            process.exit(0);
        }

    } catch (err) {
        console.error('Validation Script Error:', err);
        process.exit(1);
    }
}

validateData();
