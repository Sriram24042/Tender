# 🚀 Quick Deploy - Chainfly Online

## ⚡ Fastest Way to Deploy (5 minutes)

### Step 1: Backend on Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chainfly-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy your backend URL (e.g., `https://chainfly-backend.onrender.com`)

### Step 2: Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your Render backend URL from Step 1
6. Click "Deploy"
7. Wait for deployment (1-2 minutes)

### Step 3: Test Your App
1. Visit your Vercel frontend URL
2. Test uploading documents
3. Test API endpoints at your backend URL + `/docs`

## 🎯 What You Get
- **Backend**: `https://your-app.onrender.com`
- **Frontend**: `https://your-app.vercel.app`
- **API Docs**: `https://your-app.onrender.com/docs`
- **Cost**: $0/month

## 🔧 If Something Goes Wrong
1. Check the deployment logs in Render/Vercel
2. Ensure all files are committed to GitHub
3. Verify environment variables are set correctly
4. Check CORS settings in your backend

## 📱 Your App is Now Live!
Your Chainfly application is now accessible from anywhere in the world!

---
**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting. 