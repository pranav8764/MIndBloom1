# MindBloom - Gamified Mental Health Tracker

MindBloom is a production-ready, gamified mental health tracking application that helps users maintain their mental well-being through journaling, challenges, and achievements.

## ✨ Features

- **Daily Logs and Habit Tracking**: Guided journaling interface with mood tracking and customizable tags
- **Real-time Challenge Rooms**: Public or private daily wellness challenges with Socket.io
- **Visual Progress Dashboard**: Interactive charts and mood/habit trends
- **XP & Levelling System**: Earn points through engagement and streaks
- **Achievements and Badges**: Unlock milestones for streaks and gratitude practice
- **Responsive Design**: Clean, consistent UI that works on all devices
- **Production Ready**: Comprehensive error handling, authentication, and data validation

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router, Context API
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with CSS variables and responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone https://github.com/yourusername/mindbloom.git
   cd mindbloom
   npm run setup  # Installs dependencies for both frontend and backend
   ```

2. **Configure environment variables:**
   
   Create `.env` in the root directory:
   ```env
   # Frontend API URL
   VITE_API_URL=http://localhost:5000/api
   
   # JWT Secret (use a strong secret in production)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/mindbloom
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```
   
   Create `server/.env`:
   ```env
   # MongoDB Connection (can be Atlas URI)
   MONGODB_URI=mongodb://localhost:27017/mindbloom
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the application:**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev:full
   
   # OR start them separately:
   # Terminal 1 - Backend
   npm run server:dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🧪 Testing

Test the server functionality:
```bash
npm run test:server
```

This will run automated tests to verify:
- Database connection
- User registration and authentication
- API endpoints
- Journal functionality
- Achievement system

## 📁 Project Structure

```
mindbloom/
├── public/                 # Static assets
├── server/                 # Backend application
│   ├── middleware/         # Auth and other middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route handlers
│   ├── sockets/           # Socket.io configuration
│   └── index.js           # Server entry point
├── src/                   # Frontend application
│   ├── components/        # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React Context providers
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── styles/            # Global styles and components
│   ├── App.jsx            # Main App component
│   └── main.jsx           # React entry point
├── .env                   # Frontend environment variables
├── test-server.js         # Server testing script
└── package.json           # Project dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server:dev       # Start backend with nodemon
npm run dev:full         # Start both frontend and backend

# Production
npm run build            # Build frontend for production
npm run start            # Build and start production server
npm run server           # Start production backend server

# Testing & Utilities
npm run test:server      # Test server functionality
npm run lint             # Run ESLint
npm run setup            # Install all dependencies
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/stats` - Get user statistics

### Journal
- `POST /api/journal` - Create journal entry
- `GET /api/journal` - Get user's journal entries
- `GET /api/journal/stats/mood` - Get mood statistics
- `GET /api/journal/stats/streak` - Get journaling streak

### Achievements
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/initialize` - Initialize default achievements
- `POST /api/achievements/:id/claim-reward` - Claim achievement reward

### Challenges
- `GET /api/challenges` - Get challenges (with filters)
- `POST /api/challenges` - Create new challenge
- `POST /api/challenges/:id/join` - Join a challenge
- `GET /api/challenges/user/active` - Get user's active challenges

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper focus management and screen reader support
- **Dark Mode Support**: Respects user's system preference
- **Consistent Styling**: Unified design system with CSS variables
- **Loading States**: Proper loading indicators and error handling
- **Optimistic Updates**: Immediate UI feedback for better user experience

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for production
- Environment variable protection
- Error handling without sensitive data exposure

## 🚀 Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure MongoDB Atlas or production database
   - Set up proper CORS origins

2. **Build and Deploy:**
   ```bash
   npm run build
   npm run start
   ```

3. **Recommended Production Setup:**
   - Use PM2 for process management
   - Set up reverse proxy with Nginx
   - Enable HTTPS with SSL certificates
   - Configure database backups
   - Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Designed for scalability and maintainability
- Focused on user experience and accessibility
- Production-ready with comprehensive testing
