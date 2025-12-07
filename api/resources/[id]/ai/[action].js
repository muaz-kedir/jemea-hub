// Vercel Serverless Function for /api/resources/:id/ai/:action (summary, flashcards, chat)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Groq from 'groq-sdk';

let firestore;
let groq;

const initFirebase = () => {
  if (getApps().length === 0) {
    try {
      let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccountJson) {
        console.error('💥 FIREBASE_SERVICE_ACCOUNT not set');
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
        console.error('💥 Service account missing required fields');
        return null;
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('✅ Firebase initialized for project:', serviceAccount.project_id);
    } catch (error) {
      console.error('💥 Firebase init error:', error);
      return null;
    }
  }
  return getFirestore();
};

const initGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('🔍 GROQ_API_KEY exists:', !!apiKey);
  console.log('🔍 GROQ_DEFAULT_MODEL:', process.env.GROQ_DEFAULT_MODEL || 'not set (using default)');
  
  if (!apiKey) {
    console.error('💥 GROQ_API_KEY is not set!');
    return null;
  }
  
  if (!groq) {
    groq = new Groq({ apiKey });
    console.log('✅ Groq client initialized');
  }
  return groq;
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { id, action } = req.query;
  console.log('📥 AI Request:', { id, action, method: req.method });
  console.log('📥 Request body:', JSON.stringify(req.body || {}).slice(0, 500));
  
  if (!id || !action) {
    return res.status(400).json({ success: false, error: 'Resource ID and action required' });
  }

  // Check environment variables
  console.log('🔍 Environment check:');
  console.log('  - FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET' : 'NOT SET');
  console.log('  - GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'NOT SET');
  console.log('  - GROQ_DEFAULT_MODEL:', process.env.GROQ_DEFAULT_MODEL || 'not set');

  firestore = initFirebase();
  groq = initGroq();

  if (!firestore) {
    console.error('💥 Firestore initialization failed');
    return res.status(500).json({ 
      success: false, 
      error: 'Firestore not configured. FIREBASE_SERVICE_ACCOUNT may be missing or invalid.',
      debug: { firebaseEnvSet: !!process.env.FIREBASE_SERVICE_ACCOUNT }
    });
  }
  
  if (!groq) {
    console.error('💥 Groq initialization failed - GROQ_API_KEY missing');
    return res.status(500).json({ 
      success: false, 
      error: 'AI service not configured. GROQ_API_KEY environment variable is missing.',
      debug: { groqKeySet: !!process.env.GROQ_API_KEY }
    });
  }

  try {
    // Get resource data
    const resourceDoc = await firestore.collection('classified_resources').doc(id).get();
    if (!resourceDoc.exists) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    const resource = resourceDoc.data();

    // Use a stable, available model - llama3-8b-8192 is reliable
    const model = process.env.GROQ_DEFAULT_MODEL || 'llama3-8b-8192';

    if (action === 'summary') {
      const prompt = `Analyze this academic resource and provide a summary.
Title: ${resource.title}
Description: ${resource.description || 'N/A'}
Course: ${resource.course || 'N/A'}
Department: ${resource.department || 'N/A'}

Provide:
1. A short summary (2-3 sentences)
2. A detailed summary (2-3 paragraphs)

Format your response as JSON:
{"summaryShort": "...", "summaryLong": "..."}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
      } catch {
        parsed = { summaryShort: responseText.slice(0, 200), summaryLong: responseText };
      }

      // Save to Firestore
      await firestore.collection('resource_ai_data').doc(id).set({
        summaryShort: parsed.summaryShort,
        summaryLong: parsed.summaryLong,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return res.status(200).json({ success: true, data: parsed });
    }

    if (action === 'flashcards') {
      const prompt = `Create 5-10 flashcards for studying this academic resource.
Title: ${resource.title}
Description: ${resource.description || 'N/A'}
Course: ${resource.course || 'N/A'}

Format as JSON array:
[{"front": "Question?", "back": "Answer"}]`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || '[]';
      let flashcards;
      try {
        flashcards = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
      } catch {
        flashcards = [];
      }

      // Save to Firestore
      await firestore.collection('resource_ai_data').doc(id).set({
        flashcards,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return res.status(200).json({ success: true, data: { flashcards } });
    }

    if (action === 'chat') {
      const { question, chatHistory = [] } = req.body || {};
      console.log('💬 Chat request:', { question: question?.slice(0, 100), historyLength: chatHistory?.length });
      
      if (!question) {
        return res.status(400).json({ success: false, error: 'Question required' });
      }

      const messages = [
        {
          role: 'system',
          content: `You are a helpful tutor assistant. Answer questions about this resource:
Title: ${resource.title}
Description: ${resource.description || 'N/A'}
Course: ${resource.course || 'N/A'}`,
        },
        ...chatHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question },
      ];

      console.log('🤖 Calling Groq API with model:', model);
      console.log('🤖 Messages count:', messages.length);

      try {
        const completion = await groq.chat.completions.create({
          messages,
          model,
          temperature: 0.7,
          max_tokens: 1000,
        });

        const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        console.log('✅ Chat response generated, length:', answer.length);

        return res.status(200).json({
          success: true,
          data: { answer, resourceTitle: resource.title },
        });
      } catch (groqError) {
        console.error('💥 Groq API error:', groqError.message);
        console.error('💥 Groq error details:', JSON.stringify(groqError, null, 2));
        return res.status(500).json({
          success: false,
          error: `AI API error: ${groqError.message}`,
          debug: { model, groqKeySet: !!process.env.GROQ_API_KEY }
        });
      }
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
