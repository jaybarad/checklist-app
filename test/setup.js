const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

// Use test database
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/checklist_app_test';

// Connect to database immediately
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to test database');
  })
  .catch(error => {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  });

// Setup global cleanup function
global.cleanupDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
};

// Setup global close function
global.closeDatabase = async () => {
  await mongoose.connection.close();
};

// Mock console.error to reduce noise during testing
global.console = {
  ...console,
  error: () => {}
};