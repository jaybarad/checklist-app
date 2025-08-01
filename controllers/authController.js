const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup controller
exports.signup = async (req, res) => {
    const { name, email, phone, username, password } = req.body;

    // Server-side validation
    if (!name || !email || !phone || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Simple email and phone validation (you can make it more advanced)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create the new user in the database
        const user = new User({ name, email, phone, username, password });
        user.userId = user._id.toString();
        await user.save();

        const token = generateToken(user._id);
        // req.session.token = token; // Store token in session
        res.redirect('/login'); // Redirect to dashboard
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login controller
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        const token = generateToken(user._id);
        // Store token in session
        req.session.token = token;
        req.session.userId = user.userId;

        res.redirect('/dashboard'); // Redirect to dashboard after login
        // res.json({ token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
