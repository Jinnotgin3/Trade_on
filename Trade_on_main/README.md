# TradeOn

**TradeOn** is a premium AI-powered B2B matchmaking platform designed to help global exporters find and connect with high-compatibility international buyers in seconds. Using a Tinder-inspired "Swipe" interface, the platform turns complex trade data into an intuitive, actionable experience.

---

## ✨ Key Features

### 🔍 1. Intelligent Matchmaking
*   **Swipe-Right to Grow**: Review curated trade partners based on your specific commodity and capacity.
*   **AI Compatibility Scoring**: Every match includes a detailed breakdown of trade volume, location bias, and product alignment.
*   **Predictive Analytics**: Our engine analyzes historical trade records to suggest the most lucrative markets for your business.

### 🤖 2. Explainable AI (XAI) Dashboard
*   **Ask AI Strategist**: Get instant, data-driven explanations of *why* a specific buyer is a good match.
*   **Portfolio Analysis**: Our AI analyzes your saved matches to provide a cohesive executive summary of your overall trade strategy and diversification.

### ✉️ 3. AI Outreach Engine (Message Hub)
*   **Tone-Aware Generation**: Automatically draft professional outreach emails in **Formal**, **Friendly**, or **Direct** tones.
*   **WhatsApp-Style Interface**: Manage all your international B2B communications in a familiar, intuitive messaging hub.
*   **Persistent History**: Every outreach is saved to your account for easy follow-ups and pipeline management.

### 🛡️ 4. Secure Onboarding
*   **3-Step Wizard**: Quickly define your operational country, commodity of interest, and trade flow (Export/Import).
*   **Persistent User Profiles**: Your preferences and swipe history are securely stored in a MongoDB database.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for smooth swipe animations), Lucide-React (icons).
-   **Backend**: Node.js, Express.
-   **Database**: MongoDB (Mongoose).
-   **AI Engine**: Google Gemini 2.0 (Generative AI).
-   **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas or a local MongoDB instance.
-   Google Gemini API Key.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd TradeOn
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_uri
    GEMINI_API_KEY=your_gemini_api_key
    PORT=5001
    ```

3.  **Install Dependencies**:
    ```bash
    # Backend
    cd backend && npm install
    
    # Frontend
    cd ../frontend && npm install
    ```

4.  **Run the Application**:
    ```bash
    # Start Backend (from /backend)
    npm start
    
    # Start Frontend (from /frontend)
    npm run dev
    ```

---



