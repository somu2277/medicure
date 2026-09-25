const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HealthArticle = require('./models/HealthArticle');
const connectDB = require('./config/db');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const articles = [
  {
    title: '10 Benefits of Daily Meditation',
    content: 'Meditation has been shown to reduce stress, improve concentration, and promote general well-being. It helps in lowering blood pressure and enhancing self-awareness.',
    excerpt: 'Discover how meditating daily can transform your life.',
    author: 'Dr. Jane Smith',
    category: 'Mental Health',
    imageUrl: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=800',
    readingTime: 5,
    tags: ['meditation', 'stress', 'wellness'],
    isTrending: true
  },
  {
    title: 'Healthy Eating for a Strong Heart',
    content: 'A heart-healthy diet includes a variety of fruits, vegetables, whole grains, and lean proteins. Limiting saturated fats and added sugars is crucial for cardiovascular health.',
    excerpt: 'Learn the best foods for maintaining a healthy heart.',
    author: 'John Doe, Nutritionist',
    category: 'Nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    readingTime: 4,
    tags: ['diet', 'heart', 'nutrition'],
    isTrending: true
  },
  {
    title: 'Understanding Vitamins and Supplements',
    content: 'While a balanced diet is the best way to get nutrients, supplements can help fill the gaps. Always consult a healthcare provider before starting new vitamins.',
    excerpt: 'Do you really need those daily supplements? We break it down.',
    author: 'Dr. Sarah Connor',
    category: 'Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    readingTime: 6,
    tags: ['vitamins', 'health', 'supplements'],
    isTrending: false
  }
];

const seedData = async () => {
  try {
    await connectDB();
    await HealthArticle.deleteMany();
    await HealthArticle.insertMany(articles);
    console.log('Articles imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

