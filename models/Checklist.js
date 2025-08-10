const mongoose = require('mongoose');

// Define the schema for a checklist item
const checklistItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

// Define the schema for a checklist
const checklistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    items: [checklistItemSchema], // An array of checklist items
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false // Optional, user can create checklist without category
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Checklist', checklistSchema);

