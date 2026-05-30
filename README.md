# LifeTracker - Modern Habit & Finance Platform

A comprehensive, full-stack application designed to help users master their routines and finances. This platform integrates habit tracking, mood monitoring, and budget management into a single, unified experience.

## 🏗️ Architecture (Migrated)

The platform has been migrated from a legacy Spring Boot architecture to a modern, high-performance Node.js stack.

**Tech Stack:**
- **Frontend**: React + Vite + TailwindCSS + Recharts + Framer Motion
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs hashing
- **Hosting**: Local development with 0.0.0.0 binding for network accessibility

## 🚀 Key Features

### 📅 Habit Tracking
- **Interactive Checklist**: Mark habits as complete directly from the Dashboard.
- **Visual Analytics**: Weekly heatmaps and consistency charts.
- **Streak Management**: Automated streak calculation to maintain momentum.

### 💰 Finance Integration (Smart Budgets)
- **Category-Linked Spending**: Expenses and Budgets are dynamically linked.
- **Live Breakdown**: View exactly which expenses contribute to your budget limit within each category.
- **Budget Alerts**: Real-time spending status indicators when logging new expenses.

### 🎭 Mood Tracking
- **Daily Logging**: Track your emotional well-being over a 30-day rolling period.
- **Persistent Storage**: All mood data is synced to your user profile in the cloud.

## 📁 Project Structure

```
Habit_tracker/
├── LifeTrack/               # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # High-aesthetic UI components
│   │   ├── pages/          # Dashboard, Habits, Budgets, Expenses, Mood
│   │   ├── hooks/          # Custom logic for habits, theme, and moods
│   │   └── utils/          # API utilities and formatting
├── backend/                # Node.js Backend API
│   ├── models/             # Mongoose Schemas (User, Habit, Expense, Budget, Mood)
│   ├── routes/             # RESTful API Endpoints
│   ├── middleware/         # JWT Authentication & Security
│   └── server.js           # Express server entry point
└── .env                    # Environment configuration (Mongo URI, JWT Secret)
```

## 🛠️ Setup & Execution

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Runs on http://localhost:8080*

### 2. Frontend Setup
```bash
cd LifeTrack
npm install
npm run dev
```
*Runs on http://localhost:5173*

## 🔐 Environment Variables
The following variables are required in `backend/.env`:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for token generation.
- `PORT`: Port for the backend server (default: 8080).
