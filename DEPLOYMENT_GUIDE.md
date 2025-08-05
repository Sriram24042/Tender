# Chainfly Deployment Guide

## Overview
Chainfly is a full-stack application with a React frontend and FastAPI backend. This guide covers deployment options.

## Option 1: Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Steps

1. **Prepare the Repository**
   ```bash
   # Ensure all changes are committed
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-app-name.vercel.app/api`

4. **Update API Configuration**
   - Replace `your-vercel-app.vercel.app` in `frontend/src/services/api.ts` with your actual Vercel URL

### Vercel Configuration
The `vercel.json` file configures:
- Backend: Python FastAPI app
- Frontend: React static build
- Routes: API calls go to backend, others to frontend

## Option 2: Railway Deployment

### Steps
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. Create new project from repository
4. Railway will auto-detect Python backend
5. Deploy frontend separately or use Railway's static site feature

## Option 3: Render Deployment

### Backend (Web Service)
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Static Site)
1. Create new Static Site
2. Set build command: `npm install && npm run build`
3. Set publish directory: `dist`

## Option 4: GitHub Pages (Frontend Only)

### Limitations
- Only frontend will work
- Backend functionality will be lost
- Database operations won't work

### Steps
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Update `package.json` homepage field
3. Run: `npm run deploy`

## Database Considerations

### Current Setup
- Uses SQLite database (`reminders.db`)
- File-based storage
- Not suitable for production

### Production Database Options
1. **PostgreSQL** (Recommended)
   - Update `SQLALCHEMY_DATABASE_URL` in `compliance.py`
   - Use environment variables for connection string

2. **MongoDB Atlas**
   - Free tier available
   - Good for document storage

3. **Supabase**
   - PostgreSQL with real-time features
   - Free tier available

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## Security Considerations

1. **CORS Configuration**
   - Update backend to allow your frontend domain
   - Configure in `main.py`

2. **Environment Variables**
   - Never commit sensitive data
   - Use platform-specific secret management

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

## Monitoring and Maintenance

1. **Logs**
   - Monitor application logs
   - Set up error tracking (Sentry)

2. **Performance**
   - Monitor response times
   - Optimize database queries

3. **Updates**
   - Regular dependency updates
   - Security patches

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS configuration
2. **Database Connection**: Check connection strings and credentials
3. **Build Failures**: Check dependency versions and build commands

### Support
- Check platform-specific documentation
- Review application logs
- Test locally before deploying 