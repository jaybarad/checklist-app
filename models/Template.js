const mongoose = require('mongoose');

// Define the schema for template items with alternatives
const templateItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    defaultPrice: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    category: {
        type: String,
        required: false,
        trim: true,
        maxlength: 50
    },
    isOptional: {
        type: Boolean,
        default: false
    },
    alternatives: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        price: {
            type: Number,
            min: 0,
            default: 0
        }
    }]
});

// Define the schema for template metadata
const metadataSchema = new mongoose.Schema({
    season: [{
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter', 'all']
    }],
    duration: {
        type: String,
        enum: ['quick', 'short', 'medium', 'long', 'extended'],
        default: 'medium'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    estimatedTotal: {
        type: Number,
        min: 0,
        default: 0
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30
    }]
}, { _id: false });

// Define the main Template schema
const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Template name cannot exceed 100 characters'],
        minlength: [3, 'Template name must be at least 3 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Template type is required'],
        enum: {
            values: ['system', 'user'],
            message: 'Template type must be either system or user'
        }
    },
    category: {
        type: String,
        required: [true, 'Template category is required'],
        enum: {
            values: ['shopping', 'travel', 'moving', 'event', 'routine', 'custom'],
            message: 'Invalid category selection'
        }
    },
    icon: {
        type: String,
        default: 'fas fa-list',
        trim: true,
        maxlength: [50, 'Icon class cannot exceed 50 characters']
    },
    items: {
        type: [templateItemSchema],
        validate: {
            validator: function(items) {
                return items && items.length > 0;
            },
            message: 'Template must have at least one item'
        }
    },
    metadata: {
        type: metadataSchema,
        default: () => ({})
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.type === 'user';
        },
        validate: {
            validator: function(value) {
                // Only validate userId for user templates
                return this.type === 'system' || (this.type === 'user' && value);
            },
            message: 'User ID is required for user templates'
        }
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: function(value) {
                // Allow null/undefined ratings
                return value === null || value === undefined || (Number.isInteger(value) && value >= 1 && value <= 5);
            },
            message: 'Rating must be an integer between 1 and 5'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance optimization
templateSchema.index({ type: 1, category: 1 });
templateSchema.index({ userId: 1 }, { sparse: true });
templateSchema.index({ isPublic: 1 });
templateSchema.index({ usageCount: -1 });
templateSchema.index({ rating: -1 });
templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ type: 1, isPublic: 1 });
templateSchema.index({ 'metadata.tags': 1 });

// Virtual for calculating actual estimated total from items
templateSchema.virtual('calculatedEstimatedTotal').get(function() {
    return this.items.reduce((total, item) => {
        return total + (item.defaultPrice || 0);
    }, 0);
});

// Virtual for getting required items only
templateSchema.virtual('requiredItems').get(function() {
    return this.items.filter(item => !item.isOptional);
});

// Virtual for getting optional items only
templateSchema.virtual('optionalItems').get(function() {
    return this.items.filter(item => item.isOptional);
});

// Instance method to calculate estimated total with options
templateSchema.methods.calculateEstimatedTotal = function(includeOptional = true) {
    return this.items.reduce((total, item) => {
        if (includeOptional || !item.isOptional) {
            return total + (item.defaultPrice || 0);
        }
        return total;
    }, 0);
};

// Instance method to increment usage count
templateSchema.methods.incrementUsage = async function() {
    this.usageCount += 1;
    return this.save();
};

// Instance method to get alternative items for a specific item
templateSchema.methods.getItemAlternatives = function(itemName) {
    const item = this.items.find(item => item.name === itemName);
    return item ? item.alternatives : [];
};

// Static method to find popular templates
templateSchema.statics.findPopular = function(limit = 10, category = null) {
    const query = { isPublic: true };
    if (category) {
        query.category = category;
    }
    
    return this.find(query)
        .sort({ usageCount: -1, rating: -1, createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .lean();
};

// Static method to find templates by category
templateSchema.statics.findByCategory = function(category, includePrivate = false, userId = null) {
    const query = { category };
    
    if (!includePrivate) {
        query.$or = [
            { isPublic: true },
            { userId: userId, type: 'user' }
        ];
    }
    
    return this.find(query)
        .sort({ type: 1, usageCount: -1, createdAt: -1 })
        .select('-__v')
        .populate('userId', 'name username')
        .lean();
};

// Static method to search templates by tags or name
templateSchema.statics.searchTemplates = function(searchTerm, userId = null) {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const query = {
        $or: [
            { name: searchRegex },
            { description: searchRegex },
            { 'metadata.tags': { $in: [searchRegex] } }
        ],
        $and: [
            {
                $or: [
                    { isPublic: true },
                    { userId: userId, type: 'user' }
                ]
            }
        ]
    };
    
    return this.find(query)
        .sort({ usageCount: -1, rating: -1 })
        .select('-__v')
        .populate('userId', 'name username')
        .lean();
};

// Static method to get system templates
templateSchema.statics.getSystemTemplates = function(category = null) {
    const query = { type: 'system' };
    if (category) {
        query.category = category;
    }
    
    return this.find(query)
        .sort({ category: 1, name: 1 })
        .select('-__v')
        .lean();
};

// Static method to get user's private templates
templateSchema.statics.getUserTemplates = function(userId) {
    return this.find({ userId: userId, type: 'user' })
        .sort({ createdAt: -1 })
        .select('-__v')
        .lean();
};

// Pre-save middleware to update estimated total in metadata
templateSchema.pre('save', function(next) {
    if (this.isModified('items') || this.isNew) {
        this.metadata.estimatedTotal = this.calculateEstimatedTotal(false); // Only required items
    }
    next();
});

// Pre-save middleware for validation
templateSchema.pre('save', function(next) {
    // Ensure system templates don't have userId
    if (this.type === 'system' && this.userId) {
        this.userId = undefined;
    }
    
    // Validate tags
    if (this.metadata && this.metadata.tags) {
        this.metadata.tags = this.metadata.tags.filter(tag => tag && tag.trim().length > 0);
    }
    
    next();
});

// Error handling middleware
templateSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Template with this name already exists for this user'));
    } else {
        next(error);
    }
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;