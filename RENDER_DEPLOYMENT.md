# Render Deployment Guide

## Backend Deployment on Render

### Configuration Settings

1. **Name**: `endsem-capstone` ✓

2. **Language**: `Node` ✓

3. **Branch**: `main` ✓

4. **Root Directory**: `backend` ✓

5. **Build Command**: 
   ```
   npm install && npm run prisma:generate
   ```
   **Important**: Change from `yarn` to this command. It installs dependencies and generates Prisma Client.

6. **Start Command**: 
   ```
   npm start
   ```
   **Important**: Change from `yarn start` to `npm start` since we're using npm.

7. **Instance Type**: Free (for now) ✓

### Environment Variables

Set these in the Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://uber_owner:BXjgmJN7VpH5@ep-royal-star-a10jcabw-pooler.ap-southeast-1.aws.neon.tech/uber?sslmode=require&channel_binding=require` | Your Neon database connection string |
| `JWT_SECRET` | `edustore-super-secret-jwt-key-change-this-in-production-2024` | Secret key for JWT tokens (change this to a strong random string) |
| `PORT` | (Leave empty - Render sets this automatically) | Server port |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL (update after deploying frontend) |
| `NODE_ENV` | `production` | Environment mode |

### After Deployment

1. **Get your backend URL** from Render (e.g., `https://endsem-capstone.onrender.com`)

2. **Update frontend `.env`**:
   ```
   REACT_APP_API_URL=https://endsem-capstone.onrender.com
   ```

3. **Update backend `FRONTEND_URL`** in Render dashboard with your frontend URL

### Important Notes

- **Build Command**: Must include `npm run prisma:generate` to generate Prisma Client
- **Free Tier**: Service spins down after inactivity (15 min). First request after spin-down may take 30-60 seconds.
- **Database**: Already configured with Neon
- **CORS**: Backend is configured to allow your frontend URL

### Troubleshooting

If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is correct
4. Check that `package.json` has correct scripts

### Quick Deployment Steps

1. ✅ Name: `endsem-capstone`
2. ✅ Language: `Node`
3. ✅ Branch: `main`
4. ✅ Root Directory: `backend`
5. ⚠️ **Change Build Command to**: `npm install && npm run prisma:generate`
6. ⚠️ **Change Start Command to**: `npm start`
7. ✅ Set Environment Variables (see table above)
8. ✅ Deploy!

