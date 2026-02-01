# Code-E-Pariksha Backend - Authentication API

Backend authentication service for the Code-E-Pariksha platform built with Node.js, Express, and MongoDB.

## Features

- ✅ User Registration (Student/Teacher roles)
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ JWT token + Refresh token system
- ✅ Password reset via email
- ✅ Protected routes with middleware
- ✅ Role-based authorization
- ✅ Input validation
- ✅ Error handling
- ✅ User profile management

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **express-validator** - Input validation

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/code-e-pariksha
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@code-e-pariksha.com
FRONTEND_URL=http://localhost:5173
```

### 3. Install MongoDB

**Option A: Local Installation**
- Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster and get connection string
- Update `MONGODB_URI` in `.env`

### 4. Configure Email (for password reset)

For Gmail:
1. Enable 2-factor authentication
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use App Password in `EMAIL_PASSWORD`

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Software developer",
  "institution": "MIT"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Health Check
```http
GET /api/health
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── auth.controller.js   # Authentication logic
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   └── User.model.js        # User schema
├── routes/
│   └── auth.routes.js       # Auth routes
├── utils/
│   └── sendEmail.js         # Email utility
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/teacher/admin),
  avatar: String,
  bio: String,
  institution: String,
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

1. **Registration**: User signs up → Password hashed → User saved → JWT tokens generated
2. **Login**: Credentials verified → JWT tokens generated → User data returned
3. **Protected Routes**: Token sent in header → Middleware verifies → User data attached to request
4. **Token Refresh**: Refresh token sent → New access token generated
5. **Password Reset**: Email sent with token → Token verified → Password updated

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (7 days)
- Refresh token for extended sessions (30 days)
- Password reset token expires in 10 minutes
- Input validation and sanitization
- CORS configuration
- Role-based access control

## Testing with Postman/Thunder Client

1. Import the API endpoints
2. Register a new user
3. Copy the token from response
4. Use token in Authorization header: `Bearer <token>`
5. Test protected routes

## Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`

**Email Not Sending:**
- Verify email credentials
- Check Gmail App Password
- Ensure 2FA is enabled for Gmail

**JWT Error:**
- Check JWT_SECRET is set
- Verify token format in Authorization header

## Next Steps

- [ ] Email verification
- [ ] Social authentication (Google, GitHub)
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Unit tests
- [ ] Docker containerization

## License

MIT
