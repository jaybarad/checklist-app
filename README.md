# ChecklistPro - Modern Checklist Management Application

A full-stack web application for managing checklists with categories, built with Node.js, Express, MongoDB, and modern UI design principles.

## Features

### Core Functionality
- **User Authentication**: Secure signup/login system with JWT tokens and session management
- **Checklist Management**: Create, view, and organize checklists with items and prices
- **Category System**: Organize checklists by categories with inline category creation
- **Price Tracking**: Track prices for checklist items with automatic total calculation
- **Responsive Design**: Modern glass-morphism UI that works on all devices

### Security Features
- Password hashing with bcryptjs (10 salt rounds)
- JWT token authentication with 1-hour expiration
- Session-based authentication with secure cookies
- Input validation and sanitization
- Protected routes with ownership verification
- CSRF protection through session tokens

### UI/UX Features
- Modern glass-morphism design with gradient backgrounds
- Tab-based dashboard navigation
- Collapsible checklist views
- Real-time form validation
- Password strength indicator on signup
- Loading states and smooth animations
- Category badges for easy identification

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-session** - Session management

### Frontend
- **EJS** - Template engine
- **Bootstrap 5** - CSS framework
- **Font Awesome 6** - Icons
- **Custom CSS** - Glass-morphism effects and animations

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/jaybarad/checklist-app.git
cd checklist-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/checklist-app
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas (cloud):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/checklist-app
```

4. **Start the application**

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

5. **Access the application**
```
http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /logout` - User logout

### Categories
- `GET /categories` - Get all user categories
- `POST /categories` - Create new category
- `POST /categories/:id` - Update category
- `GET /categories/delete/:id` - Delete category

### Checklists
- `GET /checklists` - Get all user checklists
- `POST /checklists` - Create new checklist
- `PUT /checklists/:id` - Update checklist
- `DELETE /checklists/:id` - Delete checklist

### Pages
- `GET /` - Home/Dashboard (protected)
- `GET /login` - Login page
- `GET /signup` - Signup page
- `GET /dashboard` - User dashboard (protected)

## Project Structure

```
checklist-app/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   └── auth.js               # JWT verification
├── models/
│   ├── User.js              # User schema
│   ├── Category.js          # Category schema
│   └── Checklist.js         # Checklist schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── category.js          # Category routes
│   ├── checklist.js         # Checklist routes
│   └── dashboard.js         # Dashboard routes
├── views/
│   ├── dashboard.ejs        # Main dashboard
│   ├── login.ejs           # Login page
│   └── signup.ejs          # Signup page
├── .env                     # Environment variables (not in repo)
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Main application file
└── README.md              # This file
```

## Usage

### Creating an Account
1. Navigate to `/signup`
2. Fill in all required fields:
   - Full Name
   - Email (unique)
   - Phone Number (10 digits)
   - Username (unique, 3-30 characters)
   - Password (minimum 6 characters)
3. Submit to create account

### Managing Categories
1. Go to the "Categories" tab in dashboard
2. Enter category name and click "Add Category"
3. Update or delete existing categories as needed
4. Categories can also be created inline when creating checklists

### Creating Checklists
1. Click on "Create Checklist" tab
2. Enter checklist title
3. Select existing category or create new one
4. Add items with names and prices
5. Click "Add Another Item" for multiple items
6. Save checklist

### Viewing Checklists
1. All checklists appear in "My Checklists" tab
2. Click on a checklist to expand and view items
3. Check off completed items
4. View total price at bottom

## Recent Updates (January 2025)

- Fixed category management URL routing issues
- Added category-checklist integration
- Fixed MongoDB deprecation warnings
- Improved API endpoint responses for JSON/form submissions
- Fixed ObjectId comparison for ownership verification
- Added inline category creation in checklist form
- Enhanced UI with category badges
- Improved error handling and validation

## Security Considerations

### Current Security Measures
- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Session management with secure cookies
- Input validation and sanitization
- SQL injection prevention through Mongoose
- XSS protection through EJS escaping

### Recommended Improvements
- Implement rate limiting on authentication endpoints
- Add HTTPS in production
- Use environment variables for all secrets
- Implement CSRF tokens
- Add request logging and monitoring
- Regular security audits

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub:
https://github.com/jaybarad/checklist-app/issues

## Author

Jay Barad - [GitHub](https://github.com/jaybarad)

---

Built with ❤️ using Node.js and MongoDB