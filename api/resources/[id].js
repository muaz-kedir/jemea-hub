// Vercel Serverless Function for /api/resources/:id
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let firestore = null;

const initFirebase = () => {
  if (firestore) return firestore;
  
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
      console.error('Firebase init error:', error.message);
      return null;
    }
  }
  
  firestore = getFirestore();
  return firestore;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'Resource ID required' });

  const db = initFirebase();
  if (!db) {
    return res.status(500).json({
      success: false,
      error: 'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT in Vercel.',
    });
  }

  try {
    if (req.method === 'GET') {
      const docRef = db.collection('classified_resources').doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      return res.status(200).json({
        success: true,
        data: { id: snapshot.id, ...snapshot.data() },
      });
    }

    if (req.method === 'DELETE') {
      const docRef = db.collection('classified_resources').doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      await docRef.delete();
      return res.status(200).json({ success: true, message: 'Resource deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
