# Military Asset Management System - Deployment Guide

## Overview
This is a full-stack application with:
- **Frontend**: React app (hosted on Netlify)
- **Backend**: Node.js/Express API (hosted on Render, Railway, or similar)
- **Database**: SQLite (can migrate to PostgreSQL for production)

---

## Phase 1: Backend Deployment (Render or Railway)

### Option A: Deploy Backend to Render

1. **Push code to GitHub**
   ```bash
   cd c:\Users\saiki\OneDrive\Desktop\KristalBall Assignment
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Render Service**
   - **Name**: military-asset-management-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free (or paid for production)

4. **Set Environment Variables on Render**
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-secure-random-string-here-change-this
   ```

5. **Deploy**
   - Render will automatically deploy when you push to GitHub
   - Copy the service URL (e.g., `https://military-asset-backend.onrender.com`)

### Option B: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project → "Deploy from GitHub repo"

2. **Configure Railway**
   - Select your repository
   - Railway will detect Node.js
   - Set start command: `node backend/server.js`

3. **Set Environment Variables in Railway**
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-secure-random-string-here
   ```

4. **Deploy & Get URL**
   - Railway provides a public URL for your backend

---

## Phase 2: Frontend Deployment to Netlify

### Step 1: Prepare Frontend for Deployment

1. **Update API Base URL in frontend**
   - Edit `military-asset-management/.env`
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

2. **Update App.js to use environment variable**
   ```javascript
   const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
   ```

3. **Build the frontend**
   ```bash
   cd military-asset-management
   npm run build
   ```

### Step 2: Deploy to Netlify

#### Option A: Using Netlify Web Interface (Recommended)

1. **Go to Netlify**
   - Visit https://netlify.com
   - Sign up/Log in with GitHub

2. **Connect Repository**
   - Click "New site from Git"
   - Choose GitHub
   - Select your `KristalBall Assignment` repository

3. **Configure Deploy Settings**
   - **Base directory**: `military-asset-management`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

4. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add variable:
     ```
     REACT_APP_API_BASE_URL=https://your-backend-url/api
     ```

5. **Deploy**
   - Netlify will automatically build and deploy

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from military-asset-management folder
cd military-asset-management
netlify deploy --prod --dir=build
```

---

## Phase 3: Database Migration (Optional but Recommended)

For production, migrate from SQLite to PostgreSQL:

### Create PostgreSQL Database

1. **Use Supabase (PostgreSQL as a Service)**
   - Go to https://supabase.com
   - Create new project
   - Get connection string

2. **Or use Render PostgreSQL**
   - Create PostgreSQL database in Render
   - Get connection string

3. **Update Backend**
   - Install PostgreSQL driver: `npm install pg`
   - Update `database.js` to use PostgreSQL
   - Update connection string in Render/Railway environment

---

## Phase 4: Testing Production Deployment

1. **Test Backend API**
   ```bash
   curl https://your-backend-url/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. **Test Frontend**
   - Visit your Netlify URL
   - Login with test credentials
   - Verify all pages load and API calls work

3. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to verify API calls are hitting the correct backend URL

---

## Environment Variables Summary

### Frontend (Netlify)
```
REACT_APP_API_BASE_URL=https://your-backend-domain/api
```

### Backend (Render/Railway)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@host/db  # If using PostgreSQL
```

---

## Test Accounts for Production

Use these credentials to test the deployed application:

| Role | Username | Password | Base |
|------|----------|----------|------|
| Admin | admin | admin123 | All |
| Base Commander | commander | pass123 | Base Alpha |
| Logistics Officer | logistics | pass123 | Base Alpha |

---

## Troubleshooting

### CORS Issues
If you see CORS errors:
1. Verify `REACT_APP_API_BASE_URL` is set correctly
2. Backend should have CORS enabled (already configured in server.js)

### 404 on Page Refresh
Netlify's `netlify.toml` includes a redirect rule to handle client-side routing:
```
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### API Calls Failing
1. Check that backend service is running
2. Verify `REACT_APP_API_BASE_URL` environment variable is set
3. Check CORS headers in backend response

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check firewall/IP whitelist on database provider
3. For Render: Add Render's IP to database firewall

---

## Production Checklist

- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Netlify
- [ ] `REACT_APP_API_BASE_URL` environment variable set
- [ ] Backend JWT_SECRET changed from default
- [ ] Database migrated to PostgreSQL (recommended)
- [ ] SSL certificates configured (auto-handled by Netlify/Render)
- [ ] Tested login functionality
- [ ] Tested all CRUD operations
- [ ] Verified audit logs are recording
- [ ] Set up monitoring/error tracking (optional)

---

## Support Links

- **Netlify Docs**: https://docs.netlify.com/
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app/
- **React Deployment**: https://create-react-app.dev/deployment/

