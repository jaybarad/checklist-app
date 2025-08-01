const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const Checklist = require('../models/Checklist');

// Dashboard route to display categories and checklists
router.get('/dashboard', async (req, res) => {
    try {
        // Assuming you have the user ID stored in the session or token
        const userId = req.session.userId; // From session or token
// console.log(userId);
        // Fetch the user along with their categories and checklists
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const categories = await Category.find({ user: userId });
        const checklists = await Checklist.find({ userId }).lean();
        // Pass the user, categories, and checklists to the dashboard view
        res.render('dashboard', { userId, categories, checklists });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

