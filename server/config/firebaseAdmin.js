import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

let serviceAccountConfig = null;

// Option 1: Try loading from file path
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const filePath = resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const fileContent = readFileSync(filePath, 'utf8');
    serviceAccountConfig = JSON.parse(fileContent);
    console.log('✅ Firebase Admin SDK loaded from service account file');
  } catch (error) {
    console.error('❌ Failed to load service account from file:', error.message);
  }
}

// Option 2: Try parsing from JSON string
if (!serviceAccountConfig && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccountConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log('✅ Firebase Admin SDK loaded from JSON string');
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
  }
}

// Option 3: Try individual environment variables
if (!serviceAccountConfig) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    serviceAccountConfig = {
      projectId,
      clientEmail,
      privateKey,
    };
    console.log('✅ Firebase Admin SDK loaded from environment variables');
  } else {
    console.warn('⚠️  Firebase Admin SDK configuration incomplete. Firestore operations will fail until credentials are provided.');
    console.warn('   See server/FIREBASE_SETUP.md for configuration instructions.');
  }
}

if (!admin.apps.length && serviceAccountConfig) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountConfig),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;

if (!firestore) {
  console.error('❌ Firestore is not available. Resource management endpoints will not work.');
}

export { admin, firestore };
