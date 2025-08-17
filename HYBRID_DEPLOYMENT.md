# 🚀 Hybrid Deployment Guide: Vercel Frontend + Render Backend

## 📍 Current Setup

- **Frontend**: ✅ Deployed on Vercel at `https://tender-n6vxitrmo-srirams-projects-1bbca8cb.vercel.app`
- **Backend**: 🚧 Ready for Render deployment

## 🔧 Configuration Summary

### Port Configuration
- **Backend**: Port 10000 (Render standard)
- **Frontend**: Port 5173 (Vercel handles this automatically)

### CORS Configuration
- Backend allows requests from your Vercel domain
- Frontend configured to communicate with Render backend

### Environment Variables
- Frontend: `VITE_API_BASE_URL=https://chainfly-backend.onrender.com`
- Backend: `PORT=10000`, `ENVIRONMENT=production`

## 🚀 Deploy Backend to Render

### Step 1: Deploy Backend
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `chainfly-backend` directory
5. Configure:
   - **Name**: `chainfly-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `chmod +x start.sh && ./start.sh`
   - **Plan**: Free

### Step 2: Set Environment Variables
- `ENVIRONMENT`: `production`
- `PORT`: `10000` (Render sets this automatically)

### Step 3: Deploy
- Click **"Create Web Service"**
- Wait for deployment (2-3 minutes)
- Note the backend URL: `https://chainfly-backend.onrender.com`

## 🔗 Test Communication

### 1. Test Backend Health
```bash
curl https://chainfly-backend.onrender.com/
```

### 2. Test API Documentation
Visit: `https://chainfly-backend.onrender.com/docs`

### 3. Test Frontend-Backend Communication
1. Open your Vercel frontend
2. Try uploading a document
3. Check browser console for API calls
4. Verify CORS is working

## 🐛 Troubleshooting

### CORS Issues
- Backend CORS includes your Vercel domain
- Check browser console for CORS errors
- Verify backend is running and accessible

### Port Issues
- Backend uses port 10000 (Render standard)
- Frontend port handled by Vercel
- No manual port configuration needed

### API Communication
- Frontend automatically detects production environment
- API calls go to Render backend
- Check network tab in browser dev tools

## 📱 Current URLs

- **Frontend**: `https://tender-n6vxitrmo-srirams-projects-1bbca8cb.vercel.app`
- **Backend**: `https://chainfly-backend.onrender.com` (after deployment)
- **API Docs**: `https://chainfly-backend.onrender.com/docs`

## ✅ What's Already Working

- ✅ Frontend deployed on Vercel
- ✅ Frontend build configuration optimized
- ✅ CORS configured for Vercel domain
- ✅ Port configurations aligned
- ✅ Environment variables set up

## 🎯 Next Steps

1. **Deploy backend to Render** (follow steps above)
2. **Test full application functionality**
3. **Monitor API communication**
4. **Set up monitoring and alerts**
5. **Configure custom domain (optional)**

## 🔍 Monitoring

### Backend Health
- Render dashboard shows service status
- Health check endpoint: `/`
- Logs available in Render dashboard

### Frontend Performance
- Vercel analytics and performance metrics
- Real-time monitoring of API calls
- Error tracking in browser console

---

**Your hybrid deployment is almost complete! Just deploy the backend to Render and you'll have a fully functional application.** 🚀
