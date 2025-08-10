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
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: false // Optional, checklist may not be based on a template
    },
    isTemplate: {
        type: Boolean,
        default: false // Flag to indicate if this checklist is used as a template
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for performance optimization
checklistSchema.index({ userId: 1, createdAt: -1 });
checklistSchema.index({ templateId: 1 });
checklistSchema.index({ isTemplate: 1 });
checklistSchema.index({ category: 1 });

// Instance method to convert checklist to template
checklistSchema.methods.convertToTemplate = function() {
    this.isTemplate = true;
    return this.save();
};

// Instance method to calculate total value of items
checklistSchema.methods.calculateTotal = function() {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
};

// Static method to find checklists based on template
checklistSchema.statics.findByTemplate = function(templateId) {
    return this.find({ templateId: templateId })
        .populate('userId', 'name username')
        .sort({ createdAt: -1 })
        .lean();
};

// Static method to find user's template checklists
checklistSchema.statics.findUserTemplates = function(userId) {
    return this.find({ userId: userId, isTemplate: true })
        .sort({ createdAt: -1 })
        .lean();
};

module.exports = mongoose.model('Checklist', checklistSchema);

