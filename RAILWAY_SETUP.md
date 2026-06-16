# Railway Deployment Guide

## ✅ Your Backend Environment Variables

I've created a setup guide. Here's what you need to do:

## 🚀 Steps to Fix Your Backend on Railway

### 1. **Go to Railway Dashboard**
   - Open https://railway.app
   - Select your project

### 2. **Add Environment Variables**
   - Click on your **PostgreSQL** service → Variables
   - Click on your **Backend** service → Variables
   - Add these variables (copy-paste into Railway):

```
CLOUDINARY_API_KEY=489971599557911
CLOUDINARY_API_SECRET=ZMOisRlYC4bs34grhGhAueykdlc
CLOUDINARY_CLOUD_NAME=dxvr20qlb
DATABASE_URL=postgresql://neondb_owner:npg_8eC3IZcvwkMh@ep-shiny-grass-aqxduobl-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1
EMAIL_HOST=smtp.gmail.com
EMAIL_PASS=vvlgbyznwpjgilgo
EMAIL_PORT=587
EMAIL_USER=iteabhinavsharma@gmail.com
FRONTEND_URL=https://pic-portal.vercel.app
JWT_EXPIRES_IN=7d
JWT_SECRET=uturn4nature_pic_portal_jwt_secret_key_2024_secure
NODE_ENV=production
PORT=5000
```

### 3. **Verify Build Configuration**
   - In Railway, go to your Backend service → Settings
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `node dist/server.js`
   - **Health Check Path:** `/health`

### 4. **Deploy**
   - Railway will auto-redeploy when you add variables
   - Check the **Logs** tab to verify it's running
   - You should see:
     ```
     ✅ PostgreSQL database connected via Prisma
     🚀 Server running in production mode on port 5000
     ```

### 5. **Test Your Backend**
   - Once deployed, open: `https://your-railway-url.railway.app/health`
   - Should return: `{ "status": "OK", "timestamp": "..." }`
   - Or: `https://your-railway-url.railway.app/`
   - Should return: `{ "success": true, "message": "PIC Portal API is running!" }`

---

## 🔍 Common Issues & Fixes

### ❌ "Backend not responding"
**Solution:** Check Railway logs:
- Go to your Backend service → Logs
- Look for error messages
- Most common: DATABASE_URL not set or wrong format

### ❌ "Prisma Migration Error"
**Solution:** Run this in your local terminal:
```bash
cd backend
npx prisma migrate deploy
npx prisma db push
```

### ❌ "CORS Error from Frontend"
**Solution:** Verify in Railway:
- `FRONTEND_URL` must be `https://pic-portal.vercel.app`
- Must include `https://` prefix

### ❌ "Email Not Working"
**Solution:**
- EMAIL_USER: `iteabhinavsharma@gmail.com` ✅
- EMAIL_PASS: `vvlgbyznwpjgilgo` (Gmail App Password) ✅
- EMAIL_HOST: `smtp.gmail.com` ✅
- EMAIL_PORT: `587` ✅

### ❌ "Database Connection Timeout"
**Solution:** Your DATABASE_URL has connection pooling enabled:
```
?sslmode=require&pgbouncer=true&connection_limit=1
```
This is correct for Railway + Neon. No changes needed.

---

## 📊 Verify Everything Works

### Test 1: Health Check
```bash
curl https://your-railway-url.railway.app/health
```
Expected: `{"status":"OK","timestamp":"..."}`

### Test 2: Root Endpoint
```bash
curl https://your-railway-url.railway.app/
```
Expected: `{"success":true,"message":"PIC Portal API is running!"}`

### Test 3: Database Connection
Check logs for:
```
✅ PostgreSQL database connected via Prisma
```

---

## 🎯 Next Steps

1. ✅ Copy all environment variables to Railway
2. ✅ Railway will auto-build and deploy
3. ✅ Wait 2-3 minutes for deployment
4. ✅ Test health endpoint
5. ✅ Test from your frontend (should work now!)

---

## 📞 Still Not Working?

Check these in order:
1. **Railway Logs** → Look for errors
2. **Environment Variables** → Verify all 12 variables are set
3. **Build Command** → Should say `npm install && npx prisma generate && npm run build`
4. **Database** → Neon PostgreSQL should show in Railway dashboard
5. **Health Check** → `/health` endpoint should return 200 OK

**Pro Tip:** Restart the backend service in Railway if you just added env vars:
- Backend service → Settings → Restart

---

✨ Your backend should be back online now!
