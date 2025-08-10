const Template = require('../models/Template');
const Checklist = require('../models/Checklist');

// Input validation helper for templates
const validateTemplate = (req, res, next) => {
    const { name, description, category, items, metadata } = req.body;
    const errors = {};
    
    // Name validation
    if (!name || name.trim().length === 0) {
        errors.name = 'Template name is required';
    } else if (name.length < 3) {
        errors.name = 'Template name must be at least 3 characters';
    } else if (name.length > 100) {
        errors.name = 'Template name cannot exceed 100 characters';
    }
    
    // Category validation
    const validCategories = ['shopping', 'travel', 'moving', 'event', 'routine', 'custom'];
    if (!category || !validCategories.includes(category)) {
        errors.category = 'Invalid category selection';
    }
    
    // Description validation (optional)
    if (description && description.length > 500) {
        errors.description = 'Description cannot exceed 500 characters';
    }
    
    // Items validation
    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.items = 'Template must have at least one item';
    } else if (items.length > 100) {
        errors.items = 'Maximum 100 items allowed';
    } else {
        // Validate each item
        items.forEach((item, index) => {
            if (!item.name || item.name.trim().length === 0) {
                errors[`items[${index}].name`] = 'Item name is required';
            } else if (item.name.length > 100) {
                errors[`items[${index}].name`] = 'Item name cannot exceed 100 characters';
            }
            
            if (item.defaultPrice !== undefined && item.defaultPrice !== null) {
                const price = parseFloat(item.defaultPrice);
                if (isNaN(price) || price < 0) {
                    errors[`items[${index}].defaultPrice`] = 'Invalid price value';
                }
            }
            
            // Validate alternatives if provided
            if (item.alternatives && Array.isArray(item.alternatives)) {
                item.alternatives.forEach((alt, altIndex) => {
                    if (!alt.name || alt.name.trim().length === 0) {
                        errors[`items[${index}].alternatives[${altIndex}].name`] = 'Alternative name is required';
                    }
                    if (alt.price !== undefined && alt.price !== null) {
                        const altPrice = parseFloat(alt.price);
                        if (isNaN(altPrice) || altPrice < 0) {
                            errors[`items[${index}].alternatives[${altIndex}].price`] = 'Invalid alternative price';
                        }
                    }
                });
            }
        });
    }
    
    // Metadata validation (optional)
    if (metadata) {
        if (metadata.season && Array.isArray(metadata.season)) {
            const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all'];
            metadata.season.forEach(season => {
                if (!validSeasons.includes(season)) {
                    errors['metadata.season'] = 'Invalid season value';
                }
            });
        }
        
        if (metadata.duration) {
            const validDurations = ['quick', 'short', 'medium', 'long', 'extended'];
            if (!validDurations.includes(metadata.duration)) {
                errors['metadata.duration'] = 'Invalid duration value';
            }
        }
        
        if (metadata.difficulty) {
            const validDifficulties = ['beginner', 'intermediate', 'advanced'];
            if (!validDifficulties.includes(metadata.difficulty)) {
                errors['metadata.difficulty'] = 'Invalid difficulty value';
            }
        }
        
        if (metadata.tags && Array.isArray(metadata.tags)) {
            metadata.tags.forEach((tag, index) => {
                if (typeof tag !== 'string' || tag.length > 30) {
                    errors[`metadata.tags[${index}]`] = 'Tag must be a string with maximum 30 characters';
                }
            });
        }
    }
    
    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    
    next();
};

// Sanitize template data helper
const sanitizeTemplateData = (data) => {
    const sanitized = {
        name: data.name.trim(),
        description: data.description ? data.description.trim() : '',
        category: data.category,
        type: 'user', // Only users can create templates via API
        icon: data.icon || 'fas fa-list',
        isPublic: Boolean(data.isPublic),
        items: data.items.map(item => ({
            name: item.name.trim(),
            defaultPrice: item.defaultPrice ? parseFloat(item.defaultPrice) : 0,
            category: item.category ? item.category.trim() : '',
            isOptional: Boolean(item.isOptional),
            alternatives: item.alternatives ? item.alternatives.map(alt => ({
                name: alt.name.trim(),
                price: alt.price ? parseFloat(alt.price) : 0
            })) : []
        })),
        metadata: {}
    };
    
    // Sanitize metadata if provided
    if (data.metadata) {
        if (data.metadata.season) sanitized.metadata.season = data.metadata.season;
        if (data.metadata.duration) sanitized.metadata.duration = data.metadata.duration;
        if (data.metadata.difficulty) sanitized.metadata.difficulty = data.metadata.difficulty;
        if (data.metadata.tags) {
            sanitized.metadata.tags = data.metadata.tags
                .filter(tag => tag && tag.trim().length > 0)
                .map(tag => tag.trim().toLowerCase());
        }
    }
    
    return sanitized;
};

// Get current season helper
const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
};

// Controller functions

// Get all available templates (system + user's own)
const getAllTemplates = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            type,
            search,
            sort = 'popular'
        } = req.query;
        
        const skip = (page - 1) * limit;
        let query = {};
        let sortOptions = {};
        
        // Build query
        if (category) {
            query.category = category;
        }
        
        if (type && ['system', 'user'].includes(type)) {
            query.type = type;
        }
        
        // User can see system templates and their own templates
        query.$or = [
            { type: 'system' },
            { userId: req.user.userId, type: 'user' },
            { isPublic: true, type: 'user' }
        ];
        
        // Handle search
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { 'metadata.tags': { $in: [searchRegex] } }
                ]
            });
        }
        
        // Handle sorting
        switch (sort) {
            case 'popular':
                sortOptions = { usageCount: -1, rating: -1, createdAt: -1 };
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'rating':
                sortOptions = { rating: -1, usageCount: -1 };
                break;
            case 'name':
                sortOptions = { name: 1 };
                break;
            default:
                sortOptions = { usageCount: -1, rating: -1, createdAt: -1 };
        }
        
        const templates = await Template.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name username')
            .select('-__v')
            .lean();
        
        const totalCount = await Template.countDocuments(query);
        
        res.json({
            success: true,
            data: templates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
};

// Get template categories with counts
const getTemplateCategories = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const categoryCounts = await Template.aggregate([
            {
                $match: {
                    $or: [
                        { type: 'system' },
                        { userId: userId, type: 'user' },
                        { isPublic: true, type: 'user' }
                    ]
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    totalUsage: { $sum: '$usageCount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        const categories = categoryCounts.map(cat => ({
            name: cat._id,
            count: cat.count,
            avgRating: cat.avgRating ? Math.round(cat.avgRating * 10) / 10 : null,
            totalUsage: cat.totalUsage
        }));
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching template categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch template categories'
        });
    }
};

// Get specific template details
const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id)
            .populate('userId', 'name username')
            .select('-__v');
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Check if user has access to this template
        const hasAccess = template.type === 'system' || 
                         template.isPublic || 
                         (template.userId && template.userId._id.toString() === req.user.userId.toString());
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this template'
            });
        }
        
        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid template ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch template'
        });
    }
};

// Create user template
const createTemplate = async (req, res) => {
    try {
        const sanitizedData = sanitizeTemplateData(req.body);
        sanitizedData.userId = req.user.userId;
        
        const template = new Template(sanitizedData);
        await template.save();
        
        res.status(201).json({
            success: true,
            data: template,
            message: 'Template created successfully'
        });
    } catch (error) {
        console.error('Error creating template:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create template'
        });
    }
};

// Update user template
const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Check ownership - only template owner can update
        if (template.type !== 'user' || template.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own templates'
            });
        }
        
        const sanitizedData = sanitizeTemplateData(req.body);
        
        // Update template fields
        Object.keys(sanitizedData).forEach(key => {
            if (key !== 'userId' && key !== 'type') { // Prevent changing userId and type
                template[key] = sanitizedData[key];
            }
        });
        
        await template.save();
        
        res.json({
            success: true,
            data: template,
            message: 'Template updated successfully'
        });
    } catch (error) {
        console.error('Error updating template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid template ID format'
            });
        }
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update template'
        });
    }
};

// Delete user template
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Check ownership - only template owner can delete
        if (template.type !== 'user' || template.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own templates'
            });
        }
        
        await Template.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid template ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete template'
        });
    }
};

// Create checklist from template with customizations
const useTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Check if user has access to this template
        const hasAccess = template.type === 'system' || 
                         template.isPublic || 
                         (template.userId && template.userId.toString() === req.user.userId.toString());
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this template'
            });
        }
        
        const { 
            title,
            selectedItems = [], 
            customizations = {},
            categoryId 
        } = req.body;
        
        // Validate title
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Checklist title is required'
            });
        }
        
        // Build checklist items from template
        let checklistItems = [];
        
        if (selectedItems.length > 0) {
            // Use only selected items
            template.items.forEach(templateItem => {
                if (selectedItems.includes(templateItem._id.toString())) {
                    const customItem = customizations[templateItem._id.toString()] || {};
                    checklistItems.push({
                        name: customItem.name || templateItem.name,
                        price: customItem.price !== undefined ? customItem.price : templateItem.defaultPrice
                    });
                }
            });
        } else {
            // Use all required items if no selection provided
            template.items.forEach(templateItem => {
                if (!templateItem.isOptional) {
                    checklistItems.push({
                        name: templateItem.name,
                        price: templateItem.defaultPrice || 0
                    });
                }
            });
        }
        
        if (checklistItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No items selected for checklist'
            });
        }
        
        // Create the checklist
        const checklist = new Checklist({
            title: title.trim(),
            userId: req.user.userId,
            items: checklistItems,
            category: categoryId || null,
            templateId: template._id
        });
        
        await checklist.save();
        
        // Increment template usage count
        await template.incrementUsage();
        
        res.status(201).json({
            success: true,
            data: checklist,
            message: 'Checklist created from template successfully'
        });
    } catch (error) {
        console.error('Error using template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid template ID format'
            });
        }
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create checklist from template'
        });
    }
};

// Rate a template
const rateTemplate = async (req, res) => {
    try {
        const { rating } = req.body;
        
        // Validate rating
        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be an integer between 1 and 5'
            });
        }
        
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Check if user has access to this template
        const hasAccess = template.type === 'system' || 
                         template.isPublic || 
                         (template.userId && template.userId.toString() === req.user.userId.toString());
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this template'
            });
        }
        
        // For simplicity, we're storing single rating per template
        // In production, you'd want a separate ratings collection to track individual user ratings
        template.rating = rating;
        await template.save();
        
        res.json({
            success: true,
            data: { rating: template.rating },
            message: 'Template rated successfully'
        });
    } catch (error) {
        console.error('Error rating template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid template ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to rate template'
        });
    }
};

// Get smart suggestions based on context
const getSmartSuggestions = async (req, res) => {
    try {
        const { context, limit = 5 } = req.query;
        const currentSeason = getCurrentSeason();
        const userId = req.user.userId;
        
        let suggestions = [];
        
        // Get seasonal templates
        const seasonalTemplates = await Template.find({
            $or: [
                { type: 'system' },
                { userId: userId, type: 'user' },
                { isPublic: true, type: 'user' }
            ],
            $and: [
                {
                    $or: [
                        { 'metadata.season': currentSeason },
                        { 'metadata.season': 'all' }
                    ]
                }
            ]
        })
        .sort({ usageCount: -1, rating: -1 })
        .limit(parseInt(limit))
        .select('name category usageCount rating metadata')
        .lean();
        
        suggestions.push(...seasonalTemplates);
        
        // If we need more suggestions, get popular templates
        if (suggestions.length < limit) {
            const remainingLimit = limit - suggestions.length;
            const popularTemplates = await Template.find({
                $or: [
                    { type: 'system' },
                    { userId: userId, type: 'user' },
                    { isPublic: true, type: 'user' }
                ],
                _id: { $nin: suggestions.map(s => s._id) }
            })
            .sort({ usageCount: -1, rating: -1 })
            .limit(remainingLimit)
            .select('name category usageCount rating metadata')
            .lean();
            
            suggestions.push(...popularTemplates);
        }
        
        res.json({
            success: true,
            data: suggestions.slice(0, limit),
            context: {
                season: currentSeason,
                suggestedBy: context || 'general'
            }
        });
    } catch (error) {
        console.error('Error getting smart suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get template suggestions'
        });
    }
};

// Save existing checklist as template
const saveChecklistAsTemplate = async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id);
        
        if (!checklist) {
            return res.status(404).json({
                success: false,
                error: 'Checklist not found'
            });
        }
        
        // Check ownership
        if (checklist.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You can only convert your own checklists to templates'
            });
        }
        
        const { 
            templateName, 
            templateDescription, 
            templateCategory, 
            isPublic = false,
            metadata = {} 
        } = req.body;
        
        // Validate template name
        if (!templateName || templateName.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Template name is required'
            });
        }
        
        if (!templateCategory) {
            return res.status(400).json({
                success: false,
                error: 'Template category is required'
            });
        }
        
        // Convert checklist items to template items
        const templateItems = checklist.items.map(item => ({
            name: item.name,
            defaultPrice: item.price || 0,
            isOptional: false,
            alternatives: []
        }));
        
        // Create template
        const template = new Template({
            name: templateName.trim(),
            description: templateDescription ? templateDescription.trim() : '',
            type: 'user',
            category: templateCategory,
            userId: req.user.userId,
            items: templateItems,
            isPublic: Boolean(isPublic),
            metadata: metadata || {}
        });
        
        await template.save();
        
        // Update checklist to mark it was converted to template
        checklist.templateId = template._id;
        await checklist.save();
        
        res.status(201).json({
            success: true,
            data: template,
            message: 'Checklist converted to template successfully'
        });
    } catch (error) {
        console.error('Error converting checklist to template:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid checklist ID format'
            });
        }
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to convert checklist to template'
        });
    }
};

module.exports = {
    validateTemplate,
    getAllTemplates,
    getTemplateCategories,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    rateTemplate,
    getSmartSuggestions,
    saveChecklistAsTemplate
};