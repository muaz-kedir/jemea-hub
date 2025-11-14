# Vercel Deployment Guide for HUMSJ

## ✅ Completed Steps

1. ✅ Added `.env` files to `.gitignore`
2. ✅ Removed `.env` from git tracking
3. ✅ Created `.env.example` template

## 📋 Pre-Deployment Checklist

### 1. **Add the Mosque Hero Image**
- Save your mosque image as `mosque-hero.jpg`
- Place it in: `c:\Users\hp\jemea-hub\public\`
- This is required for the landing page hero section

### 2. **Create `vercel.json` Configuration**
Create a file named `vercel.json` in the root directory with this content:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. **Update Firebase Configuration (IMPORTANT)**
Your Firebase credentials are currently hardcoded. For security, move them to environment variables:

**Update `src/lib/firebase.ts`:**
```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
```

**Update your `.env` file:**
```env
# Frontend Configuration
VITE_API_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA
VITE_FIREBASE_AUTH_DOMAIN=humsj-academic-sector.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=humsj-academic-sector
VITE_FIREBASE_STORAGE_BUCKET=humsj-academic-sector.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=103611783382
VITE_FIREBASE_APP_ID=1:103611783382:web:c0698dd7f51ddf25125177
VITE_FIREBASE_MEASUREMENT_ID=G-967YB88HBF
```

## 🚀 Deployment Steps

### Step 1: Commit Your Changes
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository** (jemea-hub)
5. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: **`./`** (leave as root)
   - Build Command: **`npm run build`**
   - Output Directory: **`dist`**

6. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA
   VITE_FIREBASE_AUTH_DOMAIN=humsj-academic-sector.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=humsj-academic-sector
   VITE_FIREBASE_STORAGE_BUCKET=humsj-academic-sector.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=103611783382
   VITE_FIREBASE_APP_ID=1:103611783382:web:c0698dd7f51ddf25125177
   VITE_FIREBASE_MEASUREMENT_ID=G-967YB88HBF
   ```

7. **Click "Deploy"**

### Step 3: Deploy Backend Server (Separate)

Your `/server` folder needs to be deployed separately. Options:

**Option A: Deploy to Vercel (Recommended)**
1. Create a new Vercel project for the backend
2. Point it to the `/server` directory
3. Add server environment variables from `server/.env`

**Option B: Deploy to Railway/Render**
1. These platforms are better suited for Node.js backends
2. Connect your GitHub repo
3. Set root directory to `/server`
4. Add environment variables

### Step 4: Update API URL

After deploying the backend, update the frontend's API URL:

**In Vercel Dashboard:**
- Go to your frontend project settings
- Environment Variables
- Update `VITE_API_URL` to your backend URL (e.g., `https://your-backend.vercel.app`)
- Redeploy

## 🔒 Security Recommendations

1. ✅ **Environment Variables**: Never commit `.env` files
2. ✅ **Firebase Rules**: Review your `firestore.rules` for production
3. ⚠️ **API Keys**: Consider restricting Firebase API key to your domain
4. ⚠️ **CORS**: Configure CORS in your backend for your Vercel domain

## 🔧 Post-Deployment

### Update Firebase Configuration
1. Go to Firebase Console
2. Project Settings → Authorized Domains
3. Add your Vercel domain (e.g., `your-app.vercel.app`)

### Test Your Deployment
- ✅ Landing page loads
- ✅ Mosque hero image displays
- ✅ GSAP animations work
- ✅ Authentication works
- ✅ Firebase operations work
- ✅ Dark theme displays correctly

## 📝 Common Issues

### Issue: "Failed to load module"
**Solution**: Make sure all dependencies are in `dependencies`, not `devDependencies`

### Issue: "Environment variables not defined"
**Solution**: All Vite env vars must start with `VITE_`

### Issue: "404 on page refresh"
**Solution**: The `vercel.json` rewrites should handle this

### Issue: "Firebase not initialized"
**Solution**: Check environment variables are set in Vercel dashboard

## 🎉 Your Deployment URLs

After deployment, you'll get:
- **Frontend**: `https://jemea-hub.vercel.app` (or similar)
- **Backend**: Deploy separately and update `VITE_API_URL`

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure Firebase domain is authorized
