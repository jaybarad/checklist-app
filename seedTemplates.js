// Seed System Templates Script
// Run this script to populate the database with system templates
// Usage: node seedTemplates.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { seedSystemTemplates } = require('./data/systemTemplatesFixed');

async function runSeeder() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Seed system templates
    console.log('Starting template seeding...');
    const result = await seedSystemTemplates();
    
    if (result) {
      console.log('Template seeding completed successfully!');
    } else {
      console.log('Templates already exist or seeding was skipped.');
    }
    
    // Disconnect from database
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
}

// Run the seeder
runSeeder();