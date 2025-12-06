# Production API Configuration - Vercel Serverless Functions

## Solution Implemented

The API now uses **Vercel Serverless Functions** instead of a separate Express server. This means:
- Frontend and API are deployed together with `vercel` command
- No need for separate backend deployment
- No CORS issues (same origin)
- No need to set `VITE_API_URL`

## Files Created

### API Endpoints (Vercel Serverless Functions)
- `api/health.js` - Health check endpoint
- `api/resources.js` - GET /api/resources (list resources)
- `api/resources/[id].js` - GET/DELETE /api/resources/:id
- `api/resources/[id]/ai.js` - GET /api/resources/:id/ai
- `api/resources/[id]/ai/[action].js` - POST /api/resources/:id/ai/summary|flashcards|chat
- `api/notifications/send.js` - POST /api/notifications/send
- `api/upload.js` - POST /api/upload

### Configuration
- `vercel.json` - Updated with API rewrites and CORS headers

## Required Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

```
FIREBASE_SERVICE_ACCOUNT = {"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
GROQ_API_KEY = your_groq_api_key
GROQ_DEFAULT_MODEL = llama-3.3-70b-versatile
```

### Getting FIREBASE_SERVICE_ACCOUNT

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the entire JSON content
4. Paste it as the value for `FIREBASE_SERVICE_ACCOUNT` in Vercel (as a single line)

**Important:** The JSON must be on a single line. You can use this command to convert:
```bash
cat serviceAccountKey.json | jq -c .
```

Or manually remove all newlines from the JSON.

## Deployment

Simply run:
```bash
vercel --prod
```

Or push to your connected Git repository.

## Testing

After deployment, test the API:
```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

## How It Works

1. Frontend makes API calls to `/api/resources`, `/api/upload`, etc.
2. In production, these go to Vercel Serverless Functions (same domain)
3. In development, they go to `http://localhost:5000` (Express server)

The `resourceService.ts` automatically detects the environment:
- Production: Uses same origin (empty string)
- Development: Uses `http://localhost:5000`

## Troubleshooting

### "Failed to fetch" error
1. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
2. Verify environment variables are set correctly
3. Make sure `FIREBASE_SERVICE_ACCOUNT` is valid JSON

### "Firestore not configured" error
- The `FIREBASE_SERVICE_ACCOUNT` environment variable is missing or invalid
- Make sure it's valid JSON with no extra whitespace

### Resources not loading
1. Check browser console for errors
2. Check Vercel function logs
3. Verify Firestore has data in `classified_resources` collection
