# 🚀 ReMindMe Vercel Deployment Guide

## 📋 **Prerequisites**

Before deploying, you need:
- ✅ Vercel account (free tier works)
- ✅ GitHub repository (you already have this)
- ✅ MongoDB Atlas account (for cloud database)
- ✅ Gemini API key or Emergent LLM key

---

## 🏗️ **Architecture Overview**

ReMindMe has two parts:
1. **Frontend (React)** → Deploy to Vercel
2. **Backend (FastAPI)** → Deploy as Vercel Serverless Functions

---

## 📝 **Step-by-Step Deployment**

### **STEP 1: Prepare MongoDB Atlas (Cloud Database)**

Since Vercel is serverless, you need a cloud database:

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Sign up** for free account
3. **Create a cluster**:
   - Choose FREE tier (M0)
   - Select region closest to you
   - Cluster name: `remindme-cluster`
4. **Create Database User**:
   - Go to "Database Access"
   - Add new user: `remindme-user`
   - Generate strong password (save it!)
   - Set permissions: "Read and write to any database"
5. **Whitelist IP**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
6. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://remindme-user:<password>@cluster0.xxxxx.mongodb.net/remindme?retryWrites=true&w=majority`
   - Replace `<password>` with actual password

---

### **STEP 2: Restructure Backend for Vercel**

Vercel requires specific structure for serverless functions.

#### **A. Create API directory structure**

```
/app/
  ├── api/                    # Vercel serverless functions
  │   └── index.py           # Main API endpoint
  ├── backend/               # Keep existing code
  │   ├── server.py
  │   └── ai_service.py
  ├── frontend/              # React app
  └── vercel.json            # Vercel configuration
```

#### **B. Create `/app/api/index.py`**

This will be the serverless entry point.

---

### **STEP 3: Create Vercel Configuration Files**

#### **A. Create `/app/vercel.json`**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "MONGO_URL": "@mongo_url",
    "JWT_SECRET_KEY": "@jwt_secret",
    "EMERGENT_LLM_KEY": "@emergent_llm_key"
  }
}
```

---

### **STEP 4: Update Frontend Configuration**

#### **Update `/app/frontend/.env`**

```env
# For Vercel deployment - use relative URL
REACT_APP_BACKEND_URL=/api

# For local development, use:
# REACT_APP_BACKEND_URL=http://localhost:8001
```

#### **Add build script to `/app/frontend/package.json`**

Make sure this exists in scripts:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

---

### **STEP 5: Create Requirements for Vercel**

#### **Create `/app/api/requirements.txt`**

```
fastapi==0.104.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
pymongo==4.6.0
email-validator==2.1.0
pydantic==2.5.0
pydantic-settings==2.1.0
pandas==2.1.3
pytz==2023.3
requests==2.31.0
emergentintegrations
```

---

### **STEP 6: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**

1. **Go to**: https://vercel.com/
2. **Sign in** with GitHub
3. **Click**: "Add New Project"
4. **Import** your repository: `Syvest24/ReMindMe`
5. **Configure Project**:
   - Framework Preset: `Create React App`
   - Root Directory: `./` (leave as default)
   - Build Command: `cd frontend && yarn build`
   - Output Directory: `frontend/build`
6. **Add Environment Variables**:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: Generate random string (use: https://randomkeygen.com/)
   - `JWT_ALGORITHM`: `HS256`
   - `JWT_EXPIRATION_MINUTES`: `43200`
   - `EMERGENT_LLM_KEY`: `sk-emergent-bCb63Be0e14FaE71aE`
   - `GOOGLE_CLIENT_ID`: (optional, for OAuth)
   - `GOOGLE_CLIENT_SECRET`: (optional, for OAuth)
   - `SMTP_HOST`: (optional, for email)
   - `SMTP_PORT`: (optional)
   - `SMTP_USER`: (optional)
   - `SMTP_PASSWORD`: (optional)
7. **Click**: "Deploy"

#### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /app
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? remindme
# - In which directory is your code? ./
# - Want to override settings? Yes
# - Build command? cd frontend && yarn build
# - Output directory? frontend/build

# Set environment variables
vercel env add MONGO_URL
vercel env add JWT_SECRET_KEY
vercel env add EMERGENT_LLM_KEY

# Deploy to production
vercel --prod
```

---

### **STEP 7: Post-Deployment Configuration**

#### **A. Update Frontend Environment**

After deployment, update frontend to use Vercel URL:

```env
# In Vercel dashboard, add environment variable:
REACT_APP_BACKEND_URL=https://your-project.vercel.app/api
```

#### **B. Test Deployment**

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test login/signup
3. Test contact creation
4. Test AI message generation
5. Check browser console for errors

---

## 🚨 **Important Notes**

### **1. Serverless Limitations**

Vercel serverless functions have:
- **10 second timeout** (Hobby plan)
- **50 MB size limit**
- **Cold starts** (first request may be slow)

### **2. MongoDB Connection Pooling**

For serverless, use connection pooling:
```python
from pymongo import MongoClient

# Create singleton connection
_client = None

def get_database():
    global _client
    if _client is None:
        _client = MongoClient(
            MONGO_URL,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=45000
        )
    return _client.get_database()
```

### **3. CORS Configuration**

Update CORS to allow Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",
        "http://localhost:3000"  # for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 **Alternative: Split Deployment**

If you face issues, consider splitting:

### **Option 1: Frontend on Vercel, Backend on Railway/Render**

1. **Frontend**: Deploy to Vercel (static site)
2. **Backend**: Deploy to Railway.app or Render.com
3. **Update REACT_APP_BACKEND_URL** to point to Railway/Render URL

### **Option 2: Full Stack on Render**

Deploy entire app to Render.com:
- Supports Docker
- Better for full-stack Python apps
- No serverless limitations

---

## 📊 **Expected Costs**

### **Free Tier Limits:**

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ⚠️ 10s function timeout

**MongoDB Atlas:**
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Good for MVP

**Emergent LLM Key:**
- ✅ Pay per use
- Pricing varies by model

---

## ✅ **Checklist Before Deployment**

- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained
- [ ] Environment variables ready
- [ ] vercel.json created
- [ ] api/index.py created
- [ ] api/requirements.txt created
- [ ] Frontend .env updated
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository connected to Vercel

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Build Fails**

```
Error: Module not found
```

**Solution**: Check `package.json` and `requirements.txt` have all dependencies

### **Issue 2: API Not Working**

```
404 on /api/health
```

**Solution**: 
- Check `vercel.json` routes configuration
- Ensure `api/index.py` exists
- Check Vercel function logs

### **Issue 3: MongoDB Connection Failed**

```
ServerSelectionTimeoutError
```

**Solution**:
- Verify connection string
- Check Network Access in MongoDB Atlas
- Ensure 0.0.0.0/0 is whitelisted

### **Issue 4: Environment Variables Not Working**

```
KeyError: 'MONGO_URL'
```

**Solution**:
- Add variables in Vercel dashboard
- Redeploy after adding variables

---

## 📱 **Next Steps After Deployment**

1. **Custom Domain** (Optional):
   - Go to Vercel project settings
   - Add custom domain
   - Update DNS records

2. **Analytics** (Optional):
   - Enable Vercel Analytics
   - Add monitoring

3. **Optimize**:
   - Enable caching
   - Optimize images
   - Add service worker

---

## 🆘 **Need Help?**

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Vercel Support**: https://vercel.com/support

---

**Ready to deploy? Let's start with creating the necessary files!** 🚀
