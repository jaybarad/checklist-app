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
        secret: 'jay5555', // Change this to a secure key
        resave: false,
        saveUninitialized: true,
    }));


// Routes
app.use('/api/auth', require('./routes/auth'));

// Serve signup and login pages
app.get('/signup', checkAuthenticated, (req, res) => res.render('signup'));
app.get('/login', checkAuthenticated, (req, res) => res.render('login'));

const User = require('./models/User'); // Import the User model
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
app.get('/dashboard', protect, (req, res) => {
    // Render the dashboard and pass the username
    console.log(req.user);
    res.render('dashboard', { user: req.user });
});


app.post('/logout', (req, res) => {
    req.session.destroy(() => {
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
