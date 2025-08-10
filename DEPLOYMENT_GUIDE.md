# 🚀 Chainfly Free Deployment Guide

This guide will help you deploy your Chainfly application for free using various hosting platforms.

## 🌟 Option 1: Render (Recommended - Easiest)

### Backend Deployment on Render

1. **Sign up for Render** (https://render.com) - Free account
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service:**
   - **Name**: `chainfly-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. **Environment Variables:**
   - `ENVIRONMENT`: `production`
   - `PORT`: `10000` (Render will set this automatically)

6. **Deploy!** Your backend will be available at: `https://chainfly-backend.onrender.com`

### Frontend Deployment on Render

1. **Create a new Static Site**
2. **Configure:**
   - **Name**: `chainfly-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

## 🌟 Option 2: Railway

### Backend Deployment on Railway

1. **Sign up for Railway** (https://railway.app) - Free tier with $5 credit/month
2. **Connect your GitHub repository**
3. **Deploy the backend service**
4. **Set environment variables:**
   - `ENVIRONMENT`: `production`
   - `PORT`: Railway will set this automatically

### Frontend Deployment on Railway

1. **Deploy as a static site**
2. **Build command**: `npm run build`
3. **Output directory**: `dist`

## 🌟 Option 3: Vercel + Render

### Frontend on Vercel

1. **Sign up for Vercel** (https://vercel.com) - Free tier
2. **Import your GitHub repository**
3. **Configure build settings:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables:**
   - `VITE_API_BASE_URL`: Your Render backend URL

### Backend on Render

Follow the Render backend deployment steps above.

## 🔧 Pre-deployment Setup

### 1. Update Backend CORS (Already done)
Your backend is configured to accept requests from various domains.

### 2. Environment Variables
Create `.env` files in your frontend directory:

**Development** (`env.development`):
```
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

**Production** (`env.production`):
```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_ENVIRONMENT=production
```

### 3. Build and Test Locally
```bash
# Backend
cd chainfly-backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run build
npm run preview
```

## 🚀 Quick Deploy Commands

### Render (Recommended)
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Render.com and connect your repo
# 3. Deploy automatically!
```

### Vercel Frontend
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

## 📱 Post-Deployment

1. **Test your API endpoints** at your backend URL + `/docs`
2. **Update frontend environment** with your backend URL
3. **Test the full application**
4. **Monitor logs** in your hosting platform

## 🔍 Troubleshooting

### Common Issues:

1. **CORS errors**: Check that your backend CORS settings include your frontend domain
2. **Build failures**: Ensure all dependencies are in `requirements.txt` and `package.json`
3. **Port issues**: Use `$PORT` environment variable in your start commands
4. **File uploads**: Ensure your uploads directory is properly configured

### Support:
- **Render**: Excellent documentation and support
- **Railway**: Good Discord community
- **Vercel**: Extensive documentation and examples

## 💰 Cost Breakdown

- **Render**: Free tier (750 hours/month for backend, unlimited static hosting)
- **Railway**: Free tier ($5 credit/month)
- **Vercel**: Free tier (unlimited static hosting)

## 🎯 Next Steps

1. Choose your preferred hosting platform
2. Follow the deployment steps
3. Test your deployed application
4. Set up custom domains (optional)
5. Configure monitoring and alerts

Happy deploying! 🚀 