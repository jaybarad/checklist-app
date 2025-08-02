const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const token = req.session.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('username userId');

            if (!user) {
                return res.redirect('/login');
            }

            req.user = user;
            return next();
        } catch (error) {
            return res.redirect('/login');
        }
    }
    return res.redirect('/login');
};

const verifyOwnership = (resourceUserId) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Check if the resource belongs to the authenticated user
        if (req.user.userId !== resourceUserId && req.user.userId !== req.params.userId) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }
        
        next();
    };
};

module.exports = { protect, verifyOwnership };