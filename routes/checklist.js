const express = require('express');
const router = express.Router();
const Checklist = require('../models/Checklist');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// Input validation helper
const validateChecklist = (req, res, next) => {
    const { title, items } = req.body;
    
    // Title validation
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'Checklist title is required' });
    }
    
    if (title.length > 200) {
        return res.status(400).json({ message: 'Title must be less than 200 characters' });
    }
    
    // Items validation
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Items must be an array' });
    }
    
    if (items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
    }
    
    if (items.length > 100) {
        return res.status(400).json({ message: 'Maximum 100 items allowed' });
    }
    
    // Validate each item
    for (const item of items) {
        if (!item.name || item.name.trim().length === 0) {
            return res.status(400).json({ message: 'Item name is required' });
        }
        
        if (item.name.length > 200) {
            return res.status(400).json({ message: 'Item name must be less than 200 characters' });
        }
        
        if (item.price !== undefined && item.price !== null) {
            const price = parseFloat(item.price);
            if (isNaN(price) || price < 0 || price > 9999999) {
                return res.status(400).json({ message: 'Invalid price value' });
            }
        }
    }
    
    next();
};

// Get all checklists for authenticated user
router.get('/checklists', protect, async (req, res) => {
    try {
        const checklists = await Checklist.find({ userId: req.user.userId })
            .populate('category', 'name')
            .lean();
        res.json({ checklists });
    } catch (err) {
        console.error('Error fetching checklists:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new checklist
router.post('/checklists', protect, validateChecklist, async (req, res) => {
    const { title, items, categoryId, newCategoryName } = req.body;
    
    try {
        let finalCategoryId = null;
        
        // Handle category creation or selection
        if (categoryId === 'new' && newCategoryName && newCategoryName.trim()) {
            // Create new category
            const newCategory = new Category({
                name: newCategoryName.trim(),
                user: req.user.userId
            });
            await newCategory.save();
            finalCategoryId = newCategory._id;
        } else if (categoryId && categoryId !== '' && categoryId !== 'new') {
            // Verify category exists and belongs to user
            const category = await Category.findOne({ 
                _id: categoryId, 
                user: req.user.userId 
            });
            if (category) {
                finalCategoryId = category._id;
            }
        }
        
        // Sanitize items
        const sanitizedItems = items.map(item => ({
            name: item.name.trim(),
            price: item.price ? parseFloat(item.price) : 0
        }));
        
        const checklist = new Checklist({
            title: title.trim(),
            userId: req.user.userId,
            items: sanitizedItems,
            category: finalCategoryId
        });

        await checklist.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error saving checklist:', error);
        res.status(500).json({ message: 'Server error: Could not save checklist' });
    }
});

// Update a checklist
router.put('/checklists/:id', protect, validateChecklist, async (req, res) => {
    const { title, items } = req.body;
    
    try {
        // Find checklist and verify ownership
        const checklist = await Checklist.findById(req.params.id);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        
        if (checklist.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this checklist' });
        }
        
        // Sanitize items
        const sanitizedItems = items.map(item => ({
            name: item.name.trim(),
            price: item.price ? parseFloat(item.price) : 0
        }));
        
        checklist.title = title.trim();
        checklist.items = sanitizedItems;
        await checklist.save();
        
        res.json({ message: 'Checklist updated successfully', checklist });
    } catch (err) {
        console.error('Error updating checklist:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a checklist
router.delete('/checklists/:id', protect, async (req, res) => {
    try {
        // Find checklist and verify ownership
        const checklist = await Checklist.findById(req.params.id);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        
        if (checklist.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this checklist' });
        }
        
        await Checklist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Checklist deleted successfully' });
    } catch (err) {
        console.error('Error deleting checklist:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;