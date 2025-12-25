# 🏕️ Nomad - Task Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A simple, clean task marketplace web application where creators can post tasks and workers can accept and complete them. Built with vanilla technologies for learning and demonstration purposes.

## ✨ Features

- 🔐 **Secure Authentication** - Sign up and login with email/password
- 👥 **Dual User Roles** - Task Creators and Task Workers
- 📋 **Task Management** - Create, accept, and complete tasks seamlessly
- 🔄 **Real-time Updates** - Live task status updates across the platform
- 🎨 **Clean UI** - Simple, responsive design with no frameworks
- 🛡️ **Security First** - Password hashing, JWT tokens, and role-based access

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT tokens with bcrypt password hashing
- **Deployment**: Ready for any static hosting + Node.js backend

## 📁 Project Structure

```
nomad/
├── 📁 public/                    # Frontend static files
│   ├── 📁 css/
│   │   └── styles.css           # Main stylesheet
│   ├── 📁 js/
│   │   ├── auth.js              # Authentication utilities
│   │   ├── login.js             # Login page logic
│   │   ├── signup.js            # Signup page logic
│   │   ├── creator-dashboard.js # Creator dashboard logic
│   │   ├── worker-dashboard.js  # Worker dashboard logic
│   │   └── create-task.js       # Create task page logic
│   ├── index.html               # App entry point
│   ├── login.html               # Login page
│   ├── signup.html              # Signup page
│   ├── creator-dashboard.html   # Creator dashboard
│   ├── worker-dashboard.html    # Worker dashboard
│   └── create-task.html         # Create task page
├── 📁 server/
│   └── server.js                # Express server with API endpoints
├── 📄 .env                      # Environment variables (configure this)
├── 📄 .env.example              # Environment template
├── 📄 .gitignore               # Git ignore rules
├── 📄 package.json             # Node.js dependencies and scripts
├── 📄 setup_firebase.js        # Firebase credentials setup helper
└── 📄 README.md                # This documentation
```

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Firebase Account** - [Sign up here](https://firebase.google.com/)
- **Git** (optional, for cloning)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd nomad

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials (see setup below)
nano .env  # or use your preferred editor

# Start the development server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser!

## ⚙️ Detailed Setup

### 1. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or select existing)
3. Enter project name: `nomad-task-marketplace`
4. Choose whether to enable Google Analytics (optional)
5. Click **"Create project"**

#### Enable Firestore Database
1. In your Firebase project, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location close to your users
5. Click **"Done"**

#### Get Service Account Credentials
1. Click the **⚙️ gear icon** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file (keep it secure!)

### 2. Environment Setup

#### Automatic Setup (Recommended)
```bash
# Run the setup script with your downloaded JSON file
node setup_firebase.js ~/Downloads/nomad-*-firebase-adminsdk-*.json
```

#### Manual Setup
Create a `.env` file with your Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=nomad-task-marketplace
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nomad-xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-here
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional
PORT=3000
```

### 3. Running the Application

```bash
# Development mode
npm start

# Or for development with auto-restart (if you install nodemon)
npm install -g nodemon
nodemon server/server.js
```

### 4. Access the Application

- **Main URL**: [http://localhost:3000](http://localhost:3000)
- **Direct URLs**:
  - Login: [http://localhost:3000/login.html](http://localhost:3000/login.html)
  - Signup: [http://localhost:3000/signup.html](http://localhost:3000/signup.html)

## Database Structure

### Users Collection
```javascript
{
  email: "user@example.com",
  password: "hashed_password", // bcrypt hashed
  role: "creator" | "worker",
  createdAt: FirestoreTimestamp
}
```

### Tasks Collection
```javascript
{
  title: "Task Title",
  description: "Task description",
  price: 50.00, // number
  status: "open" | "accepted" | "completed",
  createdBy: "user_id", // creator's user ID
  acceptedBy: "user_id", // worker's user ID (null if not accepted)
  createdAt: FirestoreTimestamp,
  updatedAt: FirestoreTimestamp
}
```

## 🔌 API Reference

### Authentication Endpoints

#### `POST /api/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "creator" | "worker"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "creator"
  }
}
```

#### `POST /api/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Task Management Endpoints

#### `POST /api/tasks` *(Creators Only)*
Create a new task.

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "price": "50.00"
}
```

#### `GET /api/tasks`
Get tasks filtered by user role:
- **Creators**: See only their own tasks
- **Workers**: See open tasks + their accepted tasks

#### `PUT /api/tasks/:taskId/accept` *(Workers Only)*
Accept an available task.

#### `PUT /api/tasks/:taskId/complete` *(Workers Only)*
Mark an accepted task as completed.

### Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (task already accepted)
- `500` - Internal Server Error

## 👥 User Roles & Workflow

### Task Creator
- ✅ **Create Tasks** - Post new tasks with title, description, and price
- ✅ **Monitor Progress** - View all their tasks and current status
- ✅ **Receive Updates** - Get notified when tasks are accepted/completed
- ❌ Cannot accept or complete tasks

### Task Worker
- ✅ **Browse Tasks** - View all available (open) tasks
- ✅ **Accept Tasks** - Take on available tasks one at a time
- ✅ **Complete Work** - Mark accepted tasks as completed
- ✅ **Track History** - View their accepted and completed tasks
- ❌ Cannot create new tasks

### Workflow Example
```
Creator: "Write Blog Post" → Open
Worker: Accepts task → Accepted
Worker: Completes task → Completed
Creator: Receives completed work
```

## 🧪 Testing & Demo Data

### Quick Test Accounts
Create these test accounts to explore the application:

```bash
# Creator Account
Email: creator@example.com
Password: password123
Role: Task Creator

# Worker Account
Email: worker@example.com
Password: password123
Role: Task Worker
```

### Sample Workflow
1. **Login as Creator** → Create a task:
   - Title: "Write a blog post about React"
   - Description: "Create a 500-word beginner-friendly blog post about React hooks"
   - Price: $25

2. **Login as Worker** → Accept the task

3. **Complete the task** → Mark as completed

### API Testing
Test the endpoints directly:

```bash
# Create a test user
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"creator"}'

# Get JWT token from response, then create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Task","description":"Testing API","price":"10.00"}'
```

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Role-based access control
- Input validation and sanitization

## Development Notes

- All API calls include authentication headers
- Frontend uses vanilla JavaScript with no frameworks
- Clean, simple CSS styling
- Responsive design for mobile and desktop
- Error handling for network issues

## 🚀 Deployment

### Environment Variables for Production
```env
# Use strong, unique secrets
JWT_SECRET=your-super-secure-random-jwt-secret-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Production settings
NODE_ENV=production
PORT=3000
```

### Deploy to Production
```bash
# 1. Set up your production environment
export NODE_ENV=production
export PORT=3000

# 2. Use PM2 for production deployment
npm install -g pm2
pm2 start server/server.js --name nomad-app
pm2 startup
pm2 save

# 3. Set up reverse proxy (nginx example)
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Checklist
- ✅ Use HTTPS in production
- ✅ Set strong JWT secrets
- ✅ Configure Firebase security rules
- ✅ Enable CORS properly
- ✅ Rate limiting for API endpoints
- ✅ Input validation and sanitization
- ✅ Regular dependency updates

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start development server
npm run dev        # Start with auto-restart (requires nodemon)
npm test           # Run tests (when implemented)
```

### Project Conventions
- **JavaScript**: ES6+ features, async/await
- **CSS**: Mobile-first responsive design
- **API**: RESTful endpoints with JWT auth
- **Git**: Feature branches, conventional commits

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "feat: add new feature"`
5. Push and create a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Server won't start**
```bash
# Check if port is in use
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

**Firebase connection fails**
- Verify `.env` credentials match your Firebase project
- Check Firebase Console → Project Settings → Service Accounts
- Ensure Firestore API is enabled

**Authentication errors**
- Check JWT token expiration (24 hours default)
- Verify user roles and permissions
- Clear browser localStorage if issues persist

**CORS errors**
- Server runs on `http://localhost:3000`
- Frontend makes requests to `/api/*` endpoints
- Check browser developer tools for failed requests

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm start
```

## 📊 Database Schema

### Users Collection
```javascript
{
  email: "user@example.com",     // Unique identifier
  password: "hashed_password",  // bcrypt hash
  role: "creator" | "worker",   // User type
  createdAt: Timestamp         // Registration date
}
```

### Tasks Collection
```javascript
{
  title: "Task Title",          // Task name
  description: "Details...",    // Task requirements
  price: 50.00,                 // Payment amount
  status: "open" | "accepted" | "completed",
  createdBy: "creator_id",      // Creator's user ID
  acceptedBy: "worker_id",      // Worker's user ID (nullable)
  createdAt: Timestamp,         // Creation timestamp
  updatedAt: Timestamp          // Last modification
}
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla technologies for learning purposes
- Firebase for easy database setup
- Express.js for simple API development
- bcrypt for secure password hashing

## 📋 Changelog

### v1.0.0 (Current)
- ✅ Complete task marketplace functionality
- ✅ User authentication with JWT
- ✅ Dual user roles (Creator/Worker)
- ✅ Firebase Firestore integration
- ✅ Responsive vanilla JavaScript frontend
- ✅ RESTful API with proper error handling
- ✅ Security features (bcrypt, CORS, validation)

## 🔗 Links

- **Repository**: [GitHub](https://github.com/yourusername/nomad-task-marketplace)
- **Issues**: [Report Bugs](https://github.com/yourusername/nomad-task-marketplace/issues)
- **Discussions**: [Q&A](https://github.com/yourusername/nomad-task-marketplace/discussions)

## 🤝 Support

If you found this project helpful:

- ⭐ **Star** the repository on GitHub
- 🐛 **Report** any bugs or issues
- 💡 **Suggest** new features or improvements
- 📖 **Contribute** code or documentation

---

**Built with ❤️ using vanilla technologies**

*Happy coding! 🎉*
