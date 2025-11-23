# Firebase Admin SDK Setup

The backend needs Firebase Admin credentials to write to Firestore. Follow these steps:

## Option 1: Service Account Key (Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **humsj-academic-sector**
3. Click the gear icon (⚙️) → **Project settings**
4. Navigate to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file as `serviceAccountKey.json` in the `server/` directory
7. Add to `server/.gitignore`:
   ```
   serviceAccountKey.json
   ```
8. Update `server/.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

## Option 2: Environment Variables (Recommended for Production)

Extract values from the service account JSON and set in `server/.env`:

```env
FIREBASE_PROJECT_ID=humsj-academic-sector
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@humsj-academic-sector.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key must have `\n` characters escaped as `\\n` when stored in a single-line .env value.

## Verify Setup

After configuring credentials, restart the server:

```bash
cd server
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

If you see errors, check that:
- The service account file exists and is valid JSON
- Environment variables are properly formatted
- The private key newlines are correctly escaped
