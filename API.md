# ChecklistPro API Documentation

Complete API reference for the ChecklistPro application with examples and response formats.

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require a valid JWT token stored in the session. The token is automatically managed through cookies when using the web interface, or can be passed in API calls.

## API Endpoints

### Authentication Endpoints

#### 1. User Signup
Creates a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "username": "johndoe",
  "password": "password123"
}
```

**Validation Rules:**
- All fields are required
- Email must be valid format
- Phone must be 10 digits
- Username: 3-30 characters, unique
- Password: minimum 6 characters
- Email and username must be unique

**Success Response (API):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Success Response (Form):** Redirects to `/login`

**Error Responses:**
- `400 Bad Request`: Validation errors
- `400 Bad Request`: Username/Email already exists
- `500 Internal Server Error`: Server error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "username": "johndoe",
    "password": "password123"
  }'
```

#### 2. User Login
Authenticates a user and creates a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Success Response (API):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Success Response (Form):** Redirects to `/dashboard`

**Error Responses:**
- `400 Bad Request`: Missing credentials
- `404 Not Found`: User not found
- `400 Bad Request`: Invalid password
- `500 Internal Server Error`: Server error

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

#### 3. User Logout
Destroys the user session.

**Endpoint:** `POST /logout`

**Headers Required:** Valid session cookie

**Success Response:** Redirects to `/login`

**Error Response:**
- `500 Internal Server Error`: Error logging out

### Category Endpoints

#### 1. Get All Categories
Retrieves all categories for the authenticated user.

**Endpoint:** `GET /categories`

**Headers Required:** Valid session cookie

**Success Response:**
```json
{
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shopping",
      "user": "507f1f77bcf86cd799439012"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Work Tasks",
      "user": "507f1f77bcf86cd799439012"
    }
  ]
}
```

**Error Response:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### 2. Create Category
Creates a new category.

**Endpoint:** `POST /categories`

**Headers Required:** Valid session cookie

**Request Body (Form Data or JSON):**
```
name=Shopping
```
or
```json
{
  "name": "Shopping"
}
```

**Validation:**
- Name is required
- Name must be less than 100 characters
- Name will be trimmed of whitespace

**Success Response:** Redirects to `/dashboard`

**Error Responses:**
- `400 Bad Request`: Invalid name
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### 3. Update Category
Updates an existing category.

**Endpoint:** `POST /categories/:id`

**Headers Required:** Valid session cookie

**Request Body (Form Data):**
```
name=Updated Category Name
```

**Success Response:** Redirects to `/dashboard`

**Error Responses:**
- `400 Bad Request`: Invalid name
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner of category
- `404 Not Found`: Category not found
- `500 Internal Server Error`: Server error

#### 4. Delete Category
Deletes a category.

**Endpoint:** `GET /categories/delete/:id`

**Headers Required:** Valid session cookie

**Success Response:** Redirects to `/dashboard`

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner of category
- `404 Not Found`: Category not found
- `500 Internal Server Error`: Server error

### Checklist Endpoints

#### 1. Get All Checklists
Retrieves all checklists for the authenticated user.

**Endpoint:** `GET /checklists`

**Headers Required:** Valid session cookie

**Success Response:**
```json
{
  "checklists": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Grocery Shopping",
      "items": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "name": "Milk",
          "price": 3.99
        },
        {
          "_id": "507f1f77bcf86cd799439016",
          "name": "Bread",
          "price": 2.50
        }
      ],
      "userId": "507f1f77bcf86cd799439012",
      "category": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Shopping"
      },
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

**Error Response:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### 2. Create Checklist
Creates a new checklist with optional category.

**Endpoint:** `POST /checklists`

**Headers Required:** Valid session cookie

**Request Body (Form Data):**
```
title=Grocery Shopping
categoryId=507f1f77bcf86cd799439011
items[0][name]=Milk
items[0][price]=3.99
items[1][name]=Bread
items[1][price]=2.50
```

Or with new category:
```
title=Grocery Shopping
categoryId=new
newCategoryName=Shopping
items[0][name]=Milk
items[0][price]=3.99
```

**Validation:**
- Title is required, max 200 characters
- At least one item is required
- Maximum 100 items allowed
- Each item name is required, max 200 characters
- Prices must be between 0 and 9,999,999

**Success Response:** Redirects to `/dashboard`

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### 3. Update Checklist
Updates an existing checklist.

**Endpoint:** `PUT /checklists/:id`

**Headers Required:** Valid session cookie

**Request Body (JSON):**
```json
{
  "title": "Updated Shopping List",
  "items": [
    {
      "name": "Milk",
      "price": 4.99
    },
    {
      "name": "Eggs",
      "price": 3.50
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Checklist updated successfully",
  "checklist": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Updated Shopping List",
    "items": [...],
    "userId": "507f1f77bcf86cd799439012"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner of checklist
- `404 Not Found`: Checklist not found
- `500 Internal Server Error`: Server error

#### 4. Delete Checklist
Deletes a checklist.

**Endpoint:** `DELETE /checklists/:id`

**Headers Required:** Valid session cookie

**Success Response:**
```json
{
  "message": "Checklist deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not owner of checklist
- `404 Not Found`: Checklist not found
- `500 Internal Server Error`: Server error

### Page Routes

#### 1. Dashboard
Main dashboard page (protected).

**Endpoint:** `GET /dashboard`

**Headers Required:** Valid session cookie

**Success Response:** Renders dashboard.ejs with user data, categories, and checklists

**Error Response:** Redirects to `/login` if not authenticated

#### 2. Login Page
Login form page.

**Endpoint:** `GET /login`

**Success Response:** Renders login.ejs

**Note:** Redirects to `/dashboard` if already authenticated

#### 3. Signup Page
Signup form page.

**Endpoint:** `GET /signup`

**Success Response:** Renders signup.ejs

**Note:** Redirects to `/dashboard` if already authenticated

## Error Response Format

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

## Session Management

- Sessions are stored server-side using express-session
- JWT tokens are stored in secure HTTP-only cookies
- Session duration: 24 hours
- Token expiration: 1 hour
- Automatic cleanup on logout

## Rate Limiting

**Note:** Rate limiting is not currently implemented but is recommended for production:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## CORS Configuration

CORS is currently disabled but can be enabled by uncommenting the CORS middleware in server.js for API access from different origins.

## Testing with cURL

### Login and Save Cookie:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt
```

### Use Cookie for Protected Endpoints:
```bash
curl -X GET http://localhost:5000/categories \
  -b cookies.txt
```

## Postman Collection

Import these endpoints into Postman for easy testing:

1. Set base URL as environment variable: `{{baseUrl}} = http://localhost:5000`
2. For protected routes, ensure cookies are enabled in Postman settings
3. Login first to establish session before accessing protected endpoints

## WebSocket Support

Not currently implemented. Future versions may include real-time updates for collaborative checklists.

## API Versioning

Current version: v1 (implicit)
Future versions will use URL versioning: `/api/v2/...`

## Status Codes Summary

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request (resource created)
- `302 Found`: Redirect (form submissions)
- `400 Bad Request`: Invalid input/validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (ownership check failed)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

Last Updated: January 2025