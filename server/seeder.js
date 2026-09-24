require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Category, SubCategory, HealthConcern } = require('./models/Classification');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load Data
const categoriesData = require('./data/categories.json');
const healthConcernsData = require('./data/healthConcerns.json');
const productsData = require('./data/medicines.json');

const seedData = async () => {
    try {
        await connectDB();
        
        // Clear DB
        await Product.deleteMany();
        await Category.deleteMany();
        await SubCategory.deleteMany();
        await HealthConcern.deleteMany();
        
        console.log('Cleared existing catalog data.');

        // 1. Seed Health Concerns
        const insertedHealthConcerns = await HealthConcern.insertMany(healthConcernsData);
        console.log(`Inserted ${insertedHealthConcerns.length} Health Concerns.`);

        // 2. Seed Categories & Subcategories
        const subcategoriesData = require('./data/subcategories.json');
        
        const categoryMap = {};
        const subCategoryMap = {};

        for (const cat of categoriesData) {
            const createdCat = await Category.create({ 
                name: cat.name, 
                slug: cat.slug,
                description: cat.type
            });
            categoryMap[cat.categoryId] = createdCat._id;
        }

        for (const sub of subcategoriesData) {
            if (categoryMap[sub.categoryId]) {
                const createdSub = await SubCategory.create({
                    name: sub.name,
                    slug: sub.slug,
                    parentCategory: categoryMap[sub.categoryId]
                });
                subCategoryMap[`${sub.categoryId}_${sub.subcategoryId}`] = createdSub._id;
            }
        }
        console.log('Inserted Categories and Subcategories.');

        // 3. Seed Products with strict mapping
        const productsToInsert = productsData.map(prod => {
            const catId = categoryMap[prod.categoryId];
            const subId = subCategoryMap[`${prod.categoryId}_${prod.subcategoryId}`];
            
            const hcIds = prod.healthConcernIds.map(hcName => {
                const found = insertedHealthConcerns.find(h => h.name === hcName);
                return found ? found._id : null;
            }).filter(Boolean);

            if (!catId || !subId) {
                console.warn(`Warning: Missing Category mapping for Product: ${prod.name}`);
            }
            
            return {
                ...prod,
                categoryId: catId,
                subcategoryId: subId,
                healthConcernIds: hcIds,
            };
        });

        await Product.insertMany(productsToInsert);
        console.log(`Inserted ${productsToInsert.length} Medicine Products with Category mapping.`);

        // 4. Seed Healthcare Products
        const hcProductsData = require('./data/healthcare-products.json');
        
        // Find DB category and subcategory via slug mapping
        const allCats = await Category.find();
        const allSubs = await SubCategory.find();
        
        const hcToInsert = hcProductsData.map(hp => {
            const cat = allCats.find(c => c.slug === hp.categorySlug);
            const sub = allSubs.find(s => s.slug === hp.subcategorySlug);
            
            return {
                ...hp,
                categoryId: cat ? cat._id : null,
                subcategoryId: sub ? sub._id : null,
                healthConcernIds: [] // Can be filled if they had any
            };
        });

        await Product.insertMany(hcToInsert);
        console.log(`Inserted ${hcToInsert.length} Healthcare Products!`);

        console.log('====================================');
        console.log('DATASET VALIDATION REPORT');
        console.log(`Valid Products: ${productsToInsert.length}`);
        console.log(`Missing Categories: ${productsToInsert.filter(p => !p.categoryId).length}`);
        console.log('====================================');

        process.exit();
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

seedData();
