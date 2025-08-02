const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, verifyOwnership } = require('../middleware/auth');

// Get all categories for the authenticated user
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.userId });
        res.json({ categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new category
router.post('/categories', protect, async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validate input
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        if (name.length > 100) {
            return res.status(400).json({ message: 'Category name must be less than 100 characters' });
        }
        
        const newCategory = new Category({
            name: name.trim(),
            user: req.user.userId,
        });

        await newCategory.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a category
router.post('/categories/:id', protect, async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validate input
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        if (name.length > 100) {
            return res.status(400).json({ message: 'Category name must be less than 100 characters' });
        }
        
        // Find category and verify ownership
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        if (category.user !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this category' });
        }
        
        category.name = name.trim();
        await category.save();
        
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a category
router.get('/categories/delete/:id', protect, async (req, res) => {
    try {
        // Find category and verify ownership
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        if (category.user !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this category' });
        }
        
        await Category.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;