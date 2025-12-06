// Vercel Serverless Function for /api/resources
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let firestore = null;

const initFirebase = () => {
  if (firestore) return firestore;
  
  if (getApps().length === 0) {
    try {
      let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccountJson) {
        console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        return null;
      }

      let serviceAccount;
      try {
        // First try direct parse
        try {
          serviceAccount = JSON.parse(serviceAccountJson);
        } catch (e) {
          // If direct parse fails, try cleaning up the string
          let cleaned = serviceAccountJson.trim();
          // Remove surrounding quotes if present
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
          }
          // Handle double-escaped characters
          cleaned = cleaned.replace(/\\\\n/g, '\\n');
          cleaned = cleaned.replace(/\\"/g, '"');
          serviceAccount = JSON.parse(cleaned);
        }
        
        // Validate required fields
        if (!serviceAccount.project_id) {
          console.error('Service account missing project_id');
          return null;
        }
        if (!serviceAccount.private_key) {
          console.error('Service account missing private_key');
          return null;
        }
        if (!serviceAccount.client_email) {
          console.error('Service account missing client_email');
          return null;
        }
        
        console.log('Service account parsed successfully, project:', serviceAccount.project_id);
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError.message);
        console.error('Raw value length:', serviceAccountJson?.length);
        console.error('First 100 chars:', serviceAccountJson?.substring(0, 100));
        return null;
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase init error:', error.message);
      return null;
    }
  }
  
  firestore = getFirestore();
  return firestore;
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = initFirebase();
  
  if (!db) {
    return res.status(500).json({
      success: false,
      error: 'Firebase is not configured. Please set FIREBASE_SERVICE_ACCOUNT environment variable in Vercel.',
      hint: 'Go to Vercel Dashboard → Settings → Environment Variables → Add FIREBASE_SERVICE_ACCOUNT with your service account JSON',
    });
  }

  try {
    if (req.method === 'GET') {
      const { placement, college, department, year, semester, course } = req.query;

      console.log('GET /api/resources - Query:', { placement, college, department, year, semester, course });

      let queryRef = db.collection('classified_resources');

      if (placement) queryRef = queryRef.where('placement', '==', placement);
      if (college) queryRef = queryRef.where('college', '==', college);
      if (department) queryRef = queryRef.where('department', '==', department);
      if (year) queryRef = queryRef.where('year', '==', year);
      if (semester) queryRef = queryRef.where('semester', '==', semester);
      if (course) queryRef = queryRef.where('course', '==', course);

      const snapshot = await queryRef.get();
      const resources = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Sort by createdAt descending
      resources.sort((a, b) => {
        const aTime = a.createdAt?._seconds || a.createdAt?.seconds || 0;
        const bTime = b.createdAt?._seconds || b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      console.log(`GET /api/resources - Found ${resources.length} resources`);

      return res.status(200).json({
        success: true,
        data: resources,
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
