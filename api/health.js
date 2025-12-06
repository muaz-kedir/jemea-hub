// Vercel Serverless Function for /api/health
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const firebaseEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  let firebaseStatus = 'not set';
  let parseTest = null;
  
  if (firebaseEnv) {
    firebaseStatus = `set (length: ${firebaseEnv.length})`;
    try {
      const parsed = JSON.parse(firebaseEnv);
      parseTest = {
        success: true,
        hasProjectId: !!parsed.project_id,
        hasPrivateKey: !!parsed.private_key,
        hasClientEmail: !!parsed.client_email,
        projectId: parsed.project_id,
      };
    } catch (e) {
      parseTest = {
        success: false,
        error: e.message,
        firstChars: firebaseEnv.substring(0, 50),
      };
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    envVars: {
      FIREBASE_SERVICE_ACCOUNT: firebaseStatus,
      GROQ_API_KEY: process.env.GROQ_API_KEY ? 'set' : 'not set',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'not set',
    },
    firebaseParseTest: parseTest,
  });
}
