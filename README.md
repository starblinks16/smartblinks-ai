# SmartBlinks AI - Institutional Autonomous Trading Operating System

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-blue?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/cTrader-Open%20API-green?style=for-the-badge" alt="cTrader">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge" alt="Node.js">
</p>

## 🚀 Overview

SmartBlinks AI is a production-grade, institutional autonomous trading operating system designed exclusively for **XAUUSD (Gold)** trading on **cTrader**.

### Key Features
- 🧠 **AI-Powered Decision Making** - Autonomous analysis and trading
- 📊 **Real-time Market Analysis** - Multi-timeframe intelligence
- 🔒 **Dynamic Risk Management** - Intelligent capital protection
- 📡 **Live cTrader Integration** - Real data, no simulation
- 📱 **Responsive Design** - Works on phones, tablets, and desktop

---

## 📁 Project Structure

```
smartblinks-ai/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── services/          # cTrader, AI, Market, Trading services
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Express middleware
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API and Socket services
│   │   ├── store/             # Zustand state management
│   │   ├── styles/            # CSS modules
│   │   └── types/             # TypeScript types
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🛠️ Step-by-Step Setup Guide

### Prerequisites
- GitHub account
- Render account (free tier works)
- cTrader account with Open API access

### Step 1: Download and Extract the Project

1. **Download the project files** to your phone or computer
2. **Extract the ZIP file** to a folder named `smartblinks-ai`

### Step 2: Create GitHub Repository

#### On Your Phone (using GitHub browser):

1. **Go to GitHub.com** and log in
2. Click **New Repository** (the green button)
3. **Repository name:** `smartblinks-ai`
4. **Description:** "Institutional Autonomous Trading Operating System"
5. Select **Private** (recommended)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **Create Repository**

#### Upload the Files:

1. In your new empty repository, click **uploading an existing file**
2. **Drag and drop** all the extracted files and folders
3. Click **Commit changes**

OR use the command line:

```bash
# Navigate to project folder
cd smartblinks-ai

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial SmartBlinks AI setup"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smartblinks-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Set Up Render Deployment

#### Create Backend Service:

1. **Go to Render.com** and log in
2. Click **New +** and select **Blueprint**
3. **Connect your GitHub** repository
4. Render will detect `render.yaml` or create services manually:

#### Manual Backend Setup:

1. Click **New +** → **Web Service**
2. **Connect** your `smartblinks-ai` repository
3. **Settings:**
   - **Name:** `smartblinks-ai-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

#### Manual Frontend Setup:

1. Click **New +** → **Static Site**
2. **Connect** your `smartblinks-ai` repository
3. **Settings:**
   - **Name:** `smartblinks-ai-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

### Step 4: Configure Environment Variables

#### Backend Environment Variables:

Go to your backend service → **Environment** tab → **Add Environment Variable**:

```
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://smartblinks-ai-frontend.onrender.com  (Your frontend URL)
CORS_ORIGIN=*

# cTrader OAuth Credentials (REQUIRED)
CTRADER_CLIENT_ID=your_client_id_here
CTRADER_CLIENT_SECRET=your_client_secret_here
CTRADER_REDIRECT_URI=https://smartblinks-ai-backend.onrender.com/api/auth/callback
```

#### Frontend Environment Variables:

Go to your frontend service → **Environment** tab → **Add Environment Variable**:

```
VITE_API_URL=https://smartblinks-ai-backend.onrender.com
```

### Step 5: Get cTrader Credentials

1. **Log in to cTrader Open API Portal:** https://connect.spotware.com
2. **Create a new application:**
   - **Name:** SmartBlinks AI
   - **Description:** Institutional Trading System
   - **Redirect URI:** Your Render backend URL + `/api/auth/callback`
   - Example: `https://smartblinks-ai-backend.onrender.com/api/auth/callback`
3. **Copy your:**
   - Client ID
   - Client Secret

### Step 6: Deploy and Connect

1. **Deploy your services** on Render
2. **Wait for the backend** to be live
3. **Go to your frontend** URL
4. **Click "Connect to cTrader"** in the Connection page
5. **Authorize** in the cTrader popup
6. **You're live!**

---

## 🔧 Configuration

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 3000) |
| `NODE_ENV` | Yes | Environment (production/development) |
| `CTRADER_CLIENT_ID` | Yes | cTrader OAuth Client ID |
| `CTRADER_CLIENT_SECRET` | Yes | cTrader OAuth Client Secret |
| `CTRADER_REDIRECT_URI` | Yes | OAuth callback URL |
| `FRONTEND_URL` | Yes | Frontend deployment URL |
| `CORS_ORIGIN` | No | CORS allowed origins |

---

## 📱 UI Features

### Dashboard
- **AI Core** - Futuristic robot head that reacts to AI state
- **Live Chart** - TradingView Lightweight Charts with real-time data
- **Market Brain** - Multi-timeframe analysis and market personality
- **Risk Engine** - Account health and protection status
- **Bot Controls** - Start, Stop, Pause, Resume, Emergency Stop

### Trading
- Open positions display
- Entry, current price, SL/TP levels
- Real-time P&L tracking
- Position management

### Connection
- OAuth authentication flow
- Account information display
- Connection status

### Settings
- Notification preferences
- System information

---

## 🧠 AI States

| State | Color | Description |
|-------|-------|-------------|
| IDLE | Gray | System idle, awaiting start |
| SCANNING | Blue | Actively scanning markets |
| ANALYZING | Cyan | Analyzing opportunities |
| HIGH_CONFIDENCE | Gold | High probability setup detected |
| EXECUTING | Purple | Executing trade |
| DEFENSIVE | Green | Risk-averse mode active |
| PROTECTING | Orange | Protecting profits |
| VOLATILITY_WARNING | Orange | High volatility alert |
| CRITICAL_RISK | Red | Critical risk management |
| STOPPED | Gray | System stopped |

---

## 📡 API Endpoints

### Authentication
- `GET /api/auth/auth-url` - Get OAuth URL
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/status` - Connection status
- `POST /api/auth/disconnect` - Disconnect

### Account
- `GET /api/account/info` - Account information
- `GET /api/account/positions` - Open positions
- `GET /api/account/orders` - Pending orders
- `GET /api/account/summary` - Account summary

### Market
- `GET /api/market/analysis` - Market analysis
- `GET /api/market/timeframes` - Multi-timeframe analysis
- `GET /api/market/ticker` - Current price
- `GET /api/market/candles/:timeframe` - Historical candles
- `GET /api/market/session` - Trading session info

### Trading
- `POST /api/trading/open` - Open position
- `POST /api/trading/close/:id` - Close position
- `PATCH /api/trading/modify/:id` - Modify position
- `POST /api/trading/emergency-close` - Emergency close all

### AI
- `GET /api/ai/status` - AI status
- `POST /api/ai/start` - Start AI
- `POST /api/ai/stop` - Stop AI
- `POST /api/ai/pause` - Pause AI
- `POST /api/ai/resume` - Resume AI
- `POST /api/ai/emergency-stop` - Emergency stop
- `GET /api/ai/news/upcoming` - Upcoming news events

---

## 🚨 Important Notes

### ⚠️ No Simulation
This system uses **REAL cTrader data only**. There is no sandbox or simulation mode.

### ⚠️ Capital Protection
The AI is designed to protect capital first. It will:
- Not trade during high-impact news
- Reduce aggression during high volatility
- Stop trading if drawdown exceeds limits

### ⚠️ First Deployment
After first deployment:
1. Wait for services to be fully deployed
2. Go to Connection page
3. Click "Connect to cTrader"
4. Authorize in cTrader popup
5. Wait for sync to complete
6. Start the AI

---

## 📞 Support

For issues or questions, please create an issue on GitHub.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <strong>SmartBlinks AI</strong> - Institutional Autonomous Trading Operating System
  <br>
  <em>Think. Analyze. Adapt. Protect. Evolve.</em>
</p>