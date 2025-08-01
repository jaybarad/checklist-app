const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories for a specific user
router.get('/:userId/categories', async (req, res) => {
    try {
        const categories = await Category.find({ user: req.params.userId });
        res.render('dashboard', { categories, userId: req.params.userId });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new category
router.post('/:userId/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({
            name,
            user: req.params.userId,
        });

        await newCategory.save();
        res.redirect(`/${req.params.userId}/categories`);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a category
router.post('/:userId/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await Category.findByIdAndUpdate(req.params.id, { name });
        res.redirect(`/${req.params.userId}/categories`);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a category
router.get('/:userId/categories/delete/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect(`/${req.params.userId}/categories`);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
