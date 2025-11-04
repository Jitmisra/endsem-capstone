# Render Deployment Configuration

## ⚠️ IMPORTANT: Update These Settings

### 1. Build Command
**Change from**: `yarn`  
**Change to**: 
```
npm install && npm run prisma:generate
```

### 2. Start Command  
**Change from**: `yarn start`  
**Change to**: 
```
npm start
```

## ✅ Already Correct Settings

- **Name**: `endsem-capstone` ✓
- **Language**: `Node` ✓
- **Branch**: `main` ✓
- **Root Directory**: `backend` ✓
- **Region**: `Singapore (Southeast Asia)` ✓
- **Instance Type**: `Free` ✓

## Environment Variables

Make sure these are set in Render dashboard:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://uber_owner:BXjgmJN7VpH5@ep-royal-star-a10jcabw-pooler.ap-southeast-1.aws.neon.tech/uber?sslmode=require&channel_binding=require` | ✅ Yes |
| `JWT_SECRET` | `edustore-super-secret-jwt-key-change-this-in-production-2024` | ✅ Yes |
| `PORT` | (Leave empty - Render auto-assigns) | ❌ No |
| `FRONTEND_URL` | `http://localhost:3000` (update after frontend deploy) | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

## Quick Copy-Paste Commands

### Build Command:
```
npm install && npm run prisma:generate
```

### Start Command:
```
npm start
```

## After Deployment

1. **Get your backend URL** from Render (e.g., `https://endsem-capstone.onrender.com`)

2. **Update frontend** `.env`:
   ```
   REACT_APP_API_URL=https://endsem-capstone.onrender.com
   ```

3. **Update backend** `FRONTEND_URL` in Render with your frontend URL

## Why These Changes?

- **npm instead of yarn**: The project uses npm (see `package.json`)
- **prisma:generate**: Required to generate Prisma Client before starting the server
- **postinstall script**: Added to auto-generate Prisma Client on `npm install`

## Deployment Steps

1. Click "Edit" on your service
2. Update Build Command to: `npm install && npm run prisma:generate`
3. Update Start Command to: `npm start`
4. Verify all environment variables are set
5. Click "Save Changes"
6. Render will automatically redeploy

Done! 🚀

