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

    // Trim and sanitize inputs
    const sanitizedData = {
        name: name.trim().substring(0, 100),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: username.trim().toLowerCase(),
        password: password
    };

    // Simple email and phone validation (you can make it more advanced)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(sanitizedData.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!phoneRegex.test(sanitizedData.phone)) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    
    // Username validation
    if (sanitizedData.username.length < 3 || sanitizedData.username.length > 30) {
        return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    
    // Password validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Check for existing user with same username or email
        const userExists = await User.findOne({ 
            $or: [
                { username: sanitizedData.username },
                { email: sanitizedData.email }
            ]
        });
        
        if (userExists) {
            if (userExists.username === sanitizedData.username) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            if (userExists.email === sanitizedData.email) {
                return res.status(400).json({ message: 'Email already registered' });
            }
        }

        // Create the new user in the database
        const user = new User({
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            username: sanitizedData.username,
            password: sanitizedData.password
        });
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
    
    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Sanitize username
    const sanitizedUsername = username.trim().toLowerCase();
    
    try {
        const user = await User.findOne({ username: sanitizedUsername });

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
