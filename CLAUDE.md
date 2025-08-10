# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses nodemon for auto-restart)
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`
- **Test**: Currently no tests configured (`npm test` will fail)

## Architecture Overview

This is a Node.js/Express web application for checklist management with user authentication. The application follows an MVC pattern with MongoDB as the database and features a modern glass-morphism UI design.

### Core Components

- **Server**: Express.js application (`server.js`) with session-based authentication using JWT
- **Database**: MongoDB connection configured in `config/db.js`
- **Models**: Mongoose schemas for User, Category, and Checklist entities
- **Views**: EJS templates with modern UI design (Bootstrap 5, Font Awesome, custom CSS)
- **Routes**: Separate route files for authentication, dashboard, categories, and checklists
- **Middleware**: JWT authentication middleware in `middleware/auth.js`

### Data Models

- **User**: Contains userId, name, email, phone, username, password (hashed), and references to categories
- **Category**: Simple name/user relationship for organizing checklists
- **Checklist**: Contains title, items (name/price pairs), and user reference with timestamps

### Authentication Flow

- JWT tokens stored in Express sessions
- Password hashing using bcryptjs (10 salt rounds)
- Protected routes use middleware that verifies JWT tokens
- Automatic redirects between login/dashboard based on authentication status
- Session regeneration on login/logout (security improvement needed)

### UI/UX Design

- **Modern Glass-morphism**: Semi-transparent cards with backdrop blur
- **Gradient Backgrounds**: Animated floating orbs on auth pages
- **Tab Navigation**: Dashboard organized with Bootstrap tabs
- **Responsive Design**: Mobile-first approach with breakpoint optimizations
- **Real-time Validation**: Frontend form validation with visual feedback
- **Password Strength Indicator**: Visual meter on signup page

### Key Files

- `server.js`: Main application entry point with middleware and route setup
- `config/db.js`: MongoDB connection configuration
- `models/`: Mongoose schemas for data entities
- `routes/`: Route handlers for different features
- `controllers/authController.js`: Authentication logic with JWT generation
- `middleware/auth.js`: JWT verification middleware
- `views/`: EJS templates with modern UI components
  - `dashboard.ejs`: Tab-based dashboard with collapsible checklists
  - `login.ejs`: Gradient login page with glass-morphism
  - `signup.ejs`: Enhanced signup with validation and password strength

### Environment Variables Required

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (defaults to 5000)

### Security Considerations

- Session secret is hardcoded as 'jay5555' (⚠️ MUST be moved to environment variables)
- Missing session regeneration on authentication
- No rate limiting on auth endpoints
- See `summary.md` for detailed security analysis and recommendations

### Development Notes

- Uses nodemon for development auto-restart
- Bootstrap 5 for responsive design
- Font Awesome 6 for icons
- Inter font from Google Fonts
- Custom CSS with CSS variables for theming
- No linting or testing setup currently configured
- CORS is commented out but available if needed for API access

### Recent Updates (January 2025)

- Complete UI/UX redesign with modern glass-morphism design
- Added responsive tab navigation in dashboard
- Implemented real-time form validation
- Added password strength indicator
- Fixed category management functionality (URL routing and ObjectId comparison)
- Added category-checklist integration with inline category creation
- Fixed authentication API endpoints to handle both JSON and form submissions
- Removed MongoDB deprecation warnings (useNewUrlParser, useUnifiedTopology)
- Fixed userId generation in signup controller
- Created comprehensive documentation (README.md, API.md, FEATURE_SUGGESTIONS.md)
- Documented security vulnerabilities and improvements