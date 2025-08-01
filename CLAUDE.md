# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses nodemon for auto-restart)
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`
- **Test**: Currently no tests configured (`npm test` will fail)

## Architecture Overview

This is a Node.js/Express web application for checklist management with user authentication. The application follows an MVC pattern with MongoDB as the database.

### Core Components

- **Server**: Express.js application (`server.js`) with session-based authentication using JWT
- **Database**: MongoDB connection configured in `config/db.js`
- **Models**: Mongoose schemas for User, Category, and Checklist entities
- **Views**: EJS templates for rendering HTML pages
- **Routes**: Separate route files for authentication, dashboard, categories, and checklists

### Data Models

- **User**: Contains userId, name, email, phone, username, password (hashed), and references to categories
- **Category**: Simple name/user relationship for organizing checklists
- **Checklist**: Contains title, items (name/price pairs), and user reference with timestamps

### Authentication Flow

- JWT tokens stored in Express sessions
- Password hashing using bcryptjs
- Protected routes use middleware that verifies JWT tokens
- Automatic redirects between login/dashboard based on authentication status

### Key Files

- `server.js`: Main application entry point with middleware and route setup
- `config/db.js`: MongoDB connection configuration
- `models/`: Mongoose schemas for data entities
- `routes/`: Route handlers for different features
- `controllers/authController.js`: Authentication logic
- `views/`: EJS templates for frontend rendering

### Environment Variables Required

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (defaults to 5000)

### Development Notes

- Uses nodemon for development auto-restart
- Session secret is hardcoded as 'jay5555' (should be moved to environment variables)
- No linting or testing setup currently configured
- CORS is commented out but available if needed for API access