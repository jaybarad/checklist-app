const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const jwt = require('jsonwebtoken');
// const cors = require('cors');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse form data
// app.use(cors());
// Set EJS as the view engine
app.set('view engine', 'ejs');

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || require('crypto').randomBytes(64).toString('hex'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            sameSite: 'strict'
        }
    }));


// Routes
app.use('/api/auth', require('./routes/auth'));

// Serve signup and login pages
app.get('/signup', checkAuthenticated, (req, res) => res.render('signup'));
app.get('/login', checkAuthenticated, (req, res) => res.render('login'));

const User = require('./models/User'); // Import the User model
const Category = require('./models/Category');
const Checklist = require('./models/Checklist');
const categoryRoutes = require('./routes/category');
const dashboardRoutes = require('./routes/dashboard');
const checklistRoutes = require('./routes/checklist');
// Middleware to protect the dashboard route
const protect = async (req, res, next) => {
    const token = req.session.token;
    if (token) {
        try {
            // Verify the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('username'); // Fetch the username

            if (!user) {
                return res.redirect('/login');
            }

            // Pass user info to the request object
            req.user = user;

            return next();
        } catch (error) {
            return res.redirect('/login');
        }
    }
    return res.redirect('/login');
};
// Routes
app.use('/', dashboardRoutes);
app.use('/', categoryRoutes);
app.use('/', checklistRoutes);
// Protected Dashboard Route
app.get('/dashboard', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const userId = user.userId;
        const categories = await Category.find({ user: userId });
        const checklists = await Checklist.find({ userId })
            .populate('category', 'name')
            .lean();
        res.render('dashboard', { user: req.user, userId, categories, checklists });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
});


app.post('/logout', protect, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    const token = req.session.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(); // If token is invalid, proceed to the next middleware
            }
            return res.redirect('/dashboard'); // Redirect to dashboard if token is valid
        });
    } else {
        next(); // Proceed if no token is found
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
