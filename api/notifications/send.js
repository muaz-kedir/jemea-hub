// Vercel Serverless Function for /api/notifications/send
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let firestore;

const initFirebase = () => {
  if (getApps().length === 0) {
    try {
      let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccountJson) {
        console.error('FIREBASE_SERVICE_ACCOUNT not set');
        return null;
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (e) {
        let cleaned = serviceAccountJson.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        cleaned = cleaned.replace(/\\\\n/g, '\\n').replace(/\\"/g, '"');
        serviceAccount = JSON.parse(cleaned);
      }
      
      if (!serviceAccount.project_id || !serviceAccount.private_key) {
        console.error('Service account missing required fields');
        return null;
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch (error) {
      console.error('Firebase init error:', error);
      return null;
    }
  }
  return getFirestore();
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  firestore = initFirebase();
  
  if (!firestore) {
    return res.status(500).json({
      success: false,
      error: 'Firestore is not configured.',
    });
  }

  try {
    const { title, message, type, link, metadata } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title, message, and type are required.',
      });
    }

    const notificationData = {
      title,
      message,
      type,
      link: link || null,
      metadata: metadata || {},
      readBy: [],
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('notifications').add(notificationData);

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      data: { id: docRef.id },
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
