# 🚀 Quick Start: Deploy ReMindMe to Vercel

This is a quick reference guide for deploying ReMindMe to Vercel.

## ⚡ Prerequisites

- [x] Vercel account
- [x] GitHub repository 
- [ ] MongoDB Atlas connection string
- [ ] JWT secret key

## 📦 What's Already Done

All necessary files for Vercel deployment have been created:

```
✅ /app/vercel.json           - Vercel configuration
✅ /app/api/index.py          - Serverless backend
✅ /app/api/requirements.txt  - Python dependencies
✅ /app/.vercelignore         - Files to ignore during deployment
```

## 🎯 Deployment Steps (3 Minutes)

### 1️⃣ Get MongoDB Connection String

If you don't have MongoDB Atlas:
1. Go to: https://cloud.mongodb.com/
2. Create free cluster (M0)
3. Create database user
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/remindme`

### 2️⃣ Generate JWT Secret

Run in terminal:
```bash
openssl rand -hex 32
```
Or use: https://randomkeygen.com/

### 3️⃣ Push to GitHub

```bash
git add .
git commit -m "feat: Add Vercel deployment configuration"
git push origin main
```

### 4️⃣ Deploy on Vercel

1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Keep default settings (Vercel auto-detects React)
4. Add environment variables:

```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/remindme
JWT_SECRET_KEY=your-generated-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200
EMERGENT_LLM_KEY=sk-emergent-bCb63Be0e14FaE71aE
```

5. Click "Deploy"

### 5️⃣ Test Your App

After deployment:
1. Visit: `https://your-project.vercel.app`
2. Sign up for a new account
3. Create a contact
4. Test AI message generation

## 🔍 Troubleshooting

### API not responding?
Check: `https://your-project.vercel.app/api/health`

### Deployment failed?
- Check Vercel build logs
- Verify environment variables are set
- Ensure MongoDB IP whitelist includes 0.0.0.0/0

### AI generation not working?
- Verify EMERGENT_LLM_KEY is set correctly
- Check Vercel function logs

## 📚 Full Documentation

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🆘 Need Help?

Common issues:
- **Build fails**: Check `package.json` and `requirements.txt`
- **API 404**: Verify `vercel.json` routes configuration
- **Database connection fails**: Check MongoDB Atlas network access
- **Cold start slow**: Normal for serverless (first request ~2-3s)

## 🎉 Success Checklist

- [ ] App loads at Vercel URL
- [ ] Can sign up and login
- [ ] Can create contacts
- [ ] AI message generation works
- [ ] Dashboard shows data
- [ ] No errors in browser console
