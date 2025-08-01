const express = require('express');
const router = express.Router();
const Checklist = require('../models/Checklist');
const Category = require('../models/Category');
const User = require('../models/User');

// Get all checklists for a user
router.get('/checklists', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate({
            path: 'categories',
            populate: { path: 'checklists' }
        });

        res.json(user.categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
//
// // Create a new checklist
// router.post('/:userId/:categoryId/checklists', async (req, res) => {
//     const { name, price } = req.body;
//     console.log(req.body);
//     try {
//         const category = await Category.findById(req.params.categoryId);
//
//         if (!category) {
//             return res.status(404).json({ message: 'Category not found' });
//         }
//
//         const newChecklist = new Checklist({
//             name,
//             price,
//             category: req.params.categoryId
//         });
//
//         await newChecklist.save();
//
//         // Associate the checklist with the category
//         category.checklists.push(newChecklist._id);
//         await category.save();
//
//         res.status(201).json(newChecklist);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
//
// // Update a checklist
// router.put('/:checklistId', async (req, res) => {
//     const { name, price } = req.body;
//
//     try {
//         const checklist = await Checklist.findByIdAndUpdate(req.params.checklistId, {
//             name,
//             price
//         }, { new: true });
//
//         if (!checklist) {
//             return res.status(404).json({ message: 'Checklist not found' });
//         }
//
//         res.json(checklist);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });
//
// // Delete a checklist
// router.delete('/:checklistId', async (req, res) => {
//     try {
//         const checklist = await Checklist.findByIdAndDelete(req.params.checklistId);
//
//         if (!checklist) {
//             return res.status(404).json({ message: 'Checklist not found' });
//         }
//
//         res.json({ message: 'Checklist deleted successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.post('/checklists', async (req, res) => {
    const { title, items } = req.body;
    const userId = req.session.userId;
    console.log('Form data received:', req.body);
    try {
        const checklist = new Checklist({
            title,
            userId,
            items
        });

        await checklist.save();
        res.redirect('/dashboard'); // Redirect to the dashboard or checklist list page
    } catch (error) {
        console.error('Error saving checklist:', error.message);
        res.status(500).json({ message: 'Server error: Could not save checklist' });
    }
});

module.exports = router;

