# Complete Step-by-Step Setup Guide for SmartBlinks AI

## 📦 PART 1: Download and Extract Files

1. Download the project ZIP file to your phone
2. Extract it to a folder named `smartblinks-ai`
3. The extracted folder should contain:
   - `backend/` folder
   - `frontend/` folder
   - `.gitignore`
   - `README.md`
   - `render.yaml`

---

## 🐙 PART 2: Upload to GitHub

### Option A: Upload via GitHub Browser (Recommended for Phone)

1. **Open GitHub.com** in your phone browser
2. **Log in** to your GitHub account
3. Click **New Repository**
4. Fill in:
   - **Repository name:** `smartblinks-ai`
   - **Description:** "Institutional Autonomous Trading Operating System"
   - Select **Private**
   - ✅ DO NOT check "Add a README file"
   - ✅ DO NOT add .gitignore or license yet
5. Click **Create repository**
6. On your new empty repository page, click **uploading an existing file**
7. **Open your file manager** and navigate to the extracted `smartblinks-ai` folder
8. **Select all contents** inside the `smartblinks-ai` folder (not the folder itself)
9. **Drag and drop** all selected files into the upload area
10. Click **Commit changes**

### Option B: Using Git Commands (Desktop)

```bash
# Open terminal/command prompt
# Navigate to the extracted folder
cd path/to/smartblinks-ai

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial SmartBlinks AI setup"

# Add your GitHub repository (replace with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/smartblinks-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 PART 3: Set Up Render

### Step 3.1: Create Render Account

1. Go to **Render.com**
2. Click **Sign Up** and create a free account
3. You can sign up with GitHub for easier integration

### Step 3.2: Create Backend Service

1. On Render dashboard, click **New +**
2. Select **Web Service**
3. Connect your GitHub account if not already connected
4. Find and select your `smartblinks-ai` repository
5. Configure the service:
   - **Name:** `smartblinks-ai-backend`
   - **Region:** Oregon (or your closest)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Click **Create Web Service**
7. **Wait** for the build to complete

### Step 3.3: Create Frontend Service

1. On Render dashboard, click **New +**
2. Select **Static Site**
3. Connect your GitHub account
4. Find and select your `smartblinks-ai` repository
5. Configure:
   - **Name:** `smartblinks-ai-frontend`
   - **Region:** Oregon
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
6. Click **Create Static Site**
7. **Wait** for the build to complete

---

## ⚙️ PART 4: Configure Environment Variables

### Step 4.1: Backend Environment Variables

1. Go to your **smartblinks-ai-backend** service
2. Click the **Environment** tab
3. Add the following variables (click **Add Environment Variable** for each):

```
PORT = 3000
NODE_ENV = production
CORS_ORIGIN = *
FRONTEND_URL = (Your frontend URL - see below)
CTRADER_CLIENT_ID = (Get from cTrader - see Part 5)
CTRADER_CLIENT_SECRET = (Get from cTrader - see Part 5)
CTRADER_REDIRECT_URI = https://smartblinks-ai-backend.onrender.com/api/auth/callback
```

**To get FRONTEND_URL:**
- Go to your **smartblinks-ai-frontend** service
- Find the **URL** field (e.g., `https://smartblinks-ai-frontend.onrender.com`)
- Copy that URL and set it as FRONTEND_URL in backend

### Step 4.2: Frontend Environment Variables

1. Go to your **smartblinks-ai-frontend** service
2. Click the **Environment** tab
3. Add:

```
VITE_API_URL = https://smartblinks-ai-backend.onrender.com
```

*(Replace with your actual backend URL)*

---

## 🔐 PART 5: Get cTrader Credentials

### Step 5.1: Create cTrader Open API Application

1. Go to **https://connect.spotware.com**
2. **Log in** with your cTrader credentials
3. Click **Create New App**
4. Fill in:
   - **App Name:** SmartBlinks AI
   - **Description:** Institutional Trading System
   - **App Type:** Trading Platform
5. **Redirect URI:** 
   - Format: `https://YOUR_BACKEND_URL/api/auth/callback`
   - Example: `https://smartblinks-ai-backend.onrender.com/api/auth/callback`
6. Click **Save**

### Step 5.2: Copy Your Credentials

1. In your app settings, find:
   - **Client ID** - Copy this
   - **Client Secret** - Copy this

### Step 5.3: Add Credentials to Render

1. Go back to Render → your backend service → **Environment**
2. Set:
   - `CTRADER_CLIENT_ID` = Your copied Client ID
   - `CTRADER_CLIENT_SECRET` = Your copied Client Secret

---

## 🎯 PART 6: Final Deployment

### Step 6.1: Redeploy Services

1. Go to each service on Render
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete

### Step 6.2: Test Your Deployment

1. Open your frontend URL in a browser
2. You should see the SmartBlinks AI dashboard
3. Click **Connection** in the sidebar
4. Click **Connect to cTrader**
5. Authorize in the cTrader popup
6. Wait for connection confirmation
7. Click **Start Bot** in the controls

---

## 📱 Using the App

### Dashboard
- **AI Core** - Futuristic robot head showing AI state
- **Live Chart** - Real-time XAUUSD chart
- **Market Brain** - Market analysis and personality
- **Risk Engine** - Account health monitoring
- **Bot Controls** - Start, Stop, Pause, Resume, Emergency

### Controls
- **Start Bot** - Begin AI trading
- **Pause Bot** - Pause AI temporarily
- **Resume Bot** - Continue after pause
- **Stop Bot** - Stop AI completely
- **Emergency** - Immediate stop in critical situations

---

## 🔧 Troubleshooting

### Connection Issues
- Make sure all environment variables are set correctly
- Check browser console for errors
- Verify cTrader credentials are correct

### Build Failures
- Check build logs on Render
- Ensure all files were uploaded to GitHub
- Verify package.json files are correct

### Not Getting Data
- Wait 1-2 minutes after initial connection
- Check the Live Feed panel for activity
- Verify cTrader account has positions or data

---

## 📞 Important Notes

1. **NO SIMULATION** - Everything is real
2. **Capital Protection** - AI prioritizes protecting your capital
3. **First Sync** - Initial connection may take 30-60 seconds
4. **No Hardcoding** - All URLs come from Render deployment
5. **Mobile Ready** - Works on phones, tablets, and desktop

---

## 🎉 You're All Set!

Once everything is connected and deployed:
1. The AI will scan markets
2. Analyze opportunities
3. Execute trades when confident
4. Protect your capital always

Enjoy your Institutional Trading System! 🚀