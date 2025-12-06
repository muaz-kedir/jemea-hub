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

const initGroq = () => {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { id, action } = req.query;
  if (!id || !action) return res.status(400).json({ success: false, error: 'Resource ID and action required' });

  firestore = initFirebase();
  groq = initGroq();

  if (!firestore) return res.status(500).json({ success: false, error: 'Firestore not configured' });
  if (!groq) return res.status(500).json({ success: false, error: 'AI service not configured' });

  try {
    // Get resource data
    const resourceDoc = await firestore.collection('classified_resources').doc(id).get();
    if (!resourceDoc.exists) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    const resource = resourceDoc.data();

    const model = process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile';

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
      const { question, chatHistory = [] } = req.body;
      if (!question) return res.status(400).json({ success: false, error: 'Question required' });

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

      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      return res.status(200).json({
        success: true,
        data: { answer, resourceTitle: resource.title },
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
