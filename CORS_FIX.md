# CORS Fix for Production

## Issue
Frontend at `https://endsem-capstone.vercel.app` cannot access backend at `https://endsem-capstone-i3w7.onrender.com` due to CORS policy.

## Solution

### Step 1: Update Render Environment Variable

1. Go to your Render dashboard
2. Navigate to your backend service: `endsem-capstone-i3w7`
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to:
   ```
   https://endsem-capstone.vercel.app
   ```
5. Click **Save Changes**
6. Render will automatically redeploy

### Step 2: Verify Backend Code

The backend code has been updated to:
- ✅ Allow Vercel domains automatically (any `*.vercel.app` URL)
- ✅ Support multiple frontend URLs (comma-separated)
- ✅ Better error logging for CORS issues

### Step 3: Test After Redeploy

After Render finishes redeploying (2-3 minutes):

1. Test the health endpoint:
   ```bash
   curl https://endsem-capstone-i3w7.onrender.com/api/health
   ```

2. Test from frontend - the CORS error should be resolved!

## Alternative: If Still Having Issues

If CORS still blocks after redeploy, you can temporarily allow all origins in development by updating the code, but **this is not recommended for production**.

## Current Configuration

- **Backend**: `https://endsem-capstone-i3w7.onrender.com`
- **Frontend**: `https://endsem-capstone.vercel.app`
- **FRONTEND_URL**: Should be set to `https://endsem-capstone.vercel.app` in Render

## Quick Fix Summary

1. ✅ Code updated to allow Vercel domains
2. ⚠️ **Action Required**: Update `FRONTEND_URL` in Render dashboard to `https://endsem-capstone.vercel.app`
3. ⏳ Wait for redeploy (2-3 min)
4. ✅ Test again

Done! 🚀

