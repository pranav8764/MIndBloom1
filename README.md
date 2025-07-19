# MindBloom - Gamified Mental Health Tracker

MindBloom is a gamified mental health tracking application that helps users maintain their mental well-being through journaling, challenges, and achievements.

## Features

- **Daily Logs and Habit Tracking**: Guided journaling interface with mood tracking and customizable tags
- **Real-time Challenge Rooms**: Public or private daily wellness challenges
- **Visual Progress Dashboard**: Interactive charts and mood/habit trends
- **XP & Levelling System**: Earn points through engagement and streaks
- **Achievements and Badges**: Unlock milestones for streaks and gratitude practice
- **Customization and Rewards**: Spend points on avatar upgrades, app themes, or virtual pets

## Tech Stack

- **Frontend**: React.js with custom CSS (no external CSS frameworks)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mindbloom.git
   cd mindbloom
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # API URL
   VITE_API_URL=http://localhost:5000/api

   # JWT Secret (for development only, use a secure secret in production)
   JWT_SECRET=your_secret_key

   # MongoDB URI (for development)
   MONGODB_URI=mongodb://localhost:27017/mindbloom

   # Port for the server
   PORT=5000

   # Node environment
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   # Start the backend server
   npm run server

   # In a separate terminal, start the frontend
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
mindbloom/
├── public/             # Static assets
├── server/             # Backend code
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── index.js        # Server entry point
├── src/                # Frontend code
│   ├── assets/         # Images, icons, etc.
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Development

### Running Tests

```
npm run test
```

### Building for Production

```
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created as part of a coding challenge
- Special thanks to all contributors and the open-source community
