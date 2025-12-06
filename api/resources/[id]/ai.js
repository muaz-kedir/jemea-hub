// Vercel Serverless Function for /api/resources/:id/ai
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'Resource ID required' });

  firestore = initFirebase();
  if (!firestore) return res.status(500).json({ success: false, error: 'Firestore not configured' });

  try {
    if (req.method === 'GET') {
      const docRef = firestore.collection('resource_ai_data').doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return res.status(200).json({ success: true, data: null });
      }

      return res.status(200).json({
        success: true,
        data: { resourceId: id, ...snapshot.data() },
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
