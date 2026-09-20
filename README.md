# TradeOn 🌍🤝

**TradeOn** is a premium AI-powered B2B matchmaking platform designed to help global exporters find and connect with high-compatibility international buyers. Using a Tinder-inspired "Swipe" interface, it turns complex UN commodity trade data into an intuitive, actionable experience.

---

## ✨ Features

- **🔍 Intelligent Matchmaking:** Swipe-to-connect with curated trade partners. Powered by a high-performance MongoDB aggregation engine analyzing historical commodity flow.
- **🤖 Explainable AI (XAI):** Powered by Google Gemini. Instantly get data-driven strategic explanations on *why* a specific buyer matches your portfolio.
- **✉️ AI Outreach Hub:** Draft and manage professional outreach emails with tone-aware AI generation (Formal, Friendly, Direct).
- **🛡️ Secure & Scalable:** JWT Authentication, optimized modular routing, and persistent file-based logging (Winston/Morgan).

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Winston/Morgan (Logging)
- **Database:** MongoDB Atlas (Mongoose)
- **AI Engine:** Google Gemini 2.0 Flash

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (or local instance)
- Google Gemini API Key

### 1. Environment Setup
Create a `.env` file in the **root directory** with the following keys:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/trade_on
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

### 2. Installation
Install dependencies for both frontend and backend:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Database Seeding
To populate the database with global trade records (Make sure your `.env` is configured first):
```bash
cd backend
node scripts/seed_db.js
```

### 4. Running the App
Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*(Note: Logs are automatically saved to `backend/logs/error.log` and `combined.log`)*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` to start matching!
