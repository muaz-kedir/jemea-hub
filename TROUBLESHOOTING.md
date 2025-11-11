# Image Upload Troubleshooting Guide

## Current Status Check

### ✅ What's Working:
- Backend server is running on port 5000
- Cloudinary is configured with cloud name: `dclwjaycx`
- Frontend is running on port 8080
- Image uploads to Cloudinary are successful

### ❓ What to Check:

## Step-by-Step Debugging

### 1. Check if You're Logged In

**Open Browser Console (F12) and run:**
```javascript
firebase.auth().currentUser
```

**Expected:** Should show your user object with email
**If null:** You need to log in first

---

### 2. Check Browser Console for Errors

**When you try to upload, you should see:**
```
Current user: {uid: "...", email: "..."}
Starting image upload...
Image uploaded successfully! URL: https://res.cloudinary.com/dclwjaycx/...
Saving to Firestore with data: {title: "...", imageUrl: "https://..."}
Resource added to Firestore with ID: abc123
```

**Common Errors:**

#### Error: "You must be logged in"
- **Solution:** Log in to the application first

#### Error: "Missing or insufficient permissions"
- **Solution:** Check Firestore rules are deployed
- Run: `firebase deploy --only firestore:rules`

#### Error: "Failed to fetch"
- **Solution:** Backend server is not running
- Run: `cd server && npm run dev`

#### Error: "Must supply api_key"
- **Solution:** Backend .env file is incorrect
- Check: `server/.env` has correct Cloudinary credentials

---

### 3. Verify Image URL is Saved to Firestore

**Go to Firebase Console:**
1. https://console.firebase.google.com/project/humsj-academic-sector/firestore
2. Open `library_resources` collection
3. Find your latest document
4. **Check if `imageUrl` field exists and has a Cloudinary URL**

**Expected:** `imageUrl: "https://res.cloudinary.com/dclwjaycx/image/upload/..."`

**If missing:** The save to Firestore is failing (check console errors)

---

### 4. Check Landing Page Console Logs

**Go to Landing Page and open Console (F12):**

You should see:
```
Library resources loaded: [{id: "...", title: "...", imageUrl: "https://..."}]
Resource: Your Book Title, imageUrl: https://res.cloudinary.com/dclwjaycx/...
Image loaded successfully: https://res.cloudinary.com/dclwjaycx/...
```

**If you see:**
- `imageUrl: undefined` → Image URL not saved to Firestore
- `Failed to load image: [url]` → CORS or image loading issue

---

### 5. Test Cloudinary Image URL Directly

**Copy the image URL from console and paste it in a new browser tab:**

**Expected:** Image should display

**If not:** 
- Check Cloudinary dashboard
- Verify the image was actually uploaded
- Check if URL is correct

---

## Quick Fixes

### Fix 1: Restart Everything

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Fix 2: Clear Browser Cache

- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Refresh page with `Ctrl + F5`

### Fix 3: Redeploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Fix 4: Check All Environment Variables

**Backend (`server/.env`):**
```env
CLOUDINARY_CLOUD_NAME=dclwjaycx
CLOUDINARY_API_KEY=553854382693153
CLOUDINARY_API_SECRET=hZ5rFMPVkIUAT_lsv0hl8V3CwUU
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:5000
```

---

## Common Issues & Solutions

### Issue: "Failed to save resource" Error Popup

**Possible Causes:**
1. Not logged in
2. Firestore rules blocking write
3. Missing required form fields
4. Network error

**Debug Steps:**
1. Open browser console
2. Look for the actual error message
3. Check if user is authenticated
4. Verify Firestore rules are deployed

---

### Issue: Images Upload but Don't Show on Landing Page

**Possible Causes:**
1. `imageUrl` not saved to Firestore
2. Landing page not refreshing
3. CORS issue with Cloudinary
4. Image URL is incorrect

**Debug Steps:**
1. Check Firestore console - does the document have `imageUrl`?
2. Check landing page console - are images being fetched?
3. Check landing page console - are images loading or failing?
4. Try opening the image URL directly in browser

---

### Issue: Backend Server Crashes

**Error:** `Invalid cloud_name`
- **Solution:** Check `server/.env` has correct `CLOUDINARY_CLOUD_NAME=dclwjaycx`

**Error:** `EADDRINUSE: port 5000 already in use`
- **Solution:** Kill the process: `netstat -ano | findstr :5000` then `taskkill /PID [PID] /F`

**Error:** `Must supply api_key`
- **Solution:** Check `server/.env` has all three Cloudinary credentials

---

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 8080
- [ ] Logged in to the application
- [ ] Firestore rules deployed
- [ ] Browser console open to see logs
- [ ] Try uploading a small image (< 1MB)
- [ ] Check console for success messages
- [ ] Go to landing page
- [ ] Check if image appears
- [ ] If not, check landing page console logs

---

## Still Not Working?

### Collect This Information:

1. **Backend Terminal Output** (last 20 lines)
2. **Browser Console Errors** (screenshot)
3. **Firestore Document** (screenshot showing if imageUrl exists)
4. **Landing Page Console Logs** (screenshot)

This will help identify the exact issue!

---

**Last Updated:** November 11, 2025
