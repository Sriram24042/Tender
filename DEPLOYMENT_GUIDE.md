# Render Deployment Guide

This guide will help you deploy your Chainfly application to Render.

## Prerequisites

1. A GitHub account with your code repository
2. A Render account (free tier available)
3. Your application code pushed to GitHub

## Step 1: Prepare Your Repository

Ensure your repository has the following structure:
```
tender/
├── chainfly-backend/     # Backend API
├── frontend/            # React frontend
├── render.yaml          # Render configuration
└── README.md
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your code

2. **Deploy:**
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services
   - Wait for the build and deployment to complete

### Option B: Manual Deployment

#### Deploy Backend First:

1. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `chainfly-backend` directory

2. **Configure Backend:**
   - **Name:** `chainfly-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `chmod +x start.sh && ./start.sh`
   - **Plan:** Free

3. **Environment Variables:**
   - `ENVIRONMENT`: `production`
   - `PORT`: `8000`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the backend URL (e.g., `https://chainfly-backend.onrender.com`)

#### Deploy Frontend:

1. **Create Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `frontend` directory

2. **Configure Frontend:**
   - **Name:** `chainfly-frontend`
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Publish Directory:** `dist`
   - **Plan:** Free

3. **Environment Variables:**
   - `REACT_APP_API_URL`: Your backend URL from step 1

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment to complete

## Step 3: Update Frontend API Configuration

After deployment, update your frontend API configuration:

1. **Update API Base URL:**
   - In `frontend/src/services/api.ts`
   - Change the base URL to your backend Render URL
   - Example: `https://chainfly-backend.onrender.com`

2. **Redeploy Frontend:**
   - Push changes to GitHub
   - Render will automatically redeploy

## Step 4: Configure Custom Domain (Optional)

1. **Add Custom Domain:**
   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain
   - Configure DNS records as instructed

## Environment Variables

### Backend Variables:
- `ENVIRONMENT`: `production`
- `PORT`: `8000` (Render sets this automatically)
- `DATABASE_URL`: If using external database

### Frontend Variables:
- `REACT_APP_API_URL`: Your backend Render URL

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in requirements.txt
   - Verify Python version compatibility

2. **Runtime Errors:**
   - Check application logs
   - Verify environment variables
   - Check file permissions

3. **CORS Issues:**
   - Update CORS origins in backend
   - Include your frontend domain

### Logs and Monitoring:

- **Build Logs:** Available during deployment
- **Runtime Logs:** Available in service dashboard
- **Health Checks:** Monitor service status

## Performance Optimization

1. **Enable Auto-Scaling:**
   - Upgrade to paid plan
   - Configure auto-scaling rules

2. **CDN:**
   - Static sites automatically use CDN
   - Backend can use external CDN

3. **Database:**
   - Use Render's PostgreSQL service
   - Configure connection pooling

## Cost Management

- **Free Tier:** 750 hours/month per service
- **Paid Plans:** Start at $7/month per service
- **Auto-Sleep:** Free services sleep after 15 minutes of inactivity

## Support

- **Render Documentation:** [docs.render.com](https://docs.render.com/)
- **Community:** [Render Community](https://community.render.com/)
- **Status:** [status.render.com](https://status.render.com/)

## Next Steps

After successful deployment:

1. Test all functionality
2. Set up monitoring and alerts
3. Configure backups (if using database)
4. Set up CI/CD pipeline
5. Monitor performance and costs 