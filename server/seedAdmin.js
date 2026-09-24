require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await connectDB();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@medicure.com' });
        
        if (!existingAdmin) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@medicure.com',
                passwordHash: 'password123',
                phone: '9999999999',
                role: 'SUPER_ADMIN'
            });
            console.log('✅ Admin user created successfully!');
            console.log('Email: admin@medicure.com');
            console.log('Password: password123');
        } else {
            console.log('Admin user already exists!');
            console.log('Email: admin@medicure.com');
            console.log('Password: password123');
        }
        
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
