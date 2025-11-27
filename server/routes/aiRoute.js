import express from 'express';
import pdfParse from 'pdf-parse';
import fetch from 'node-fetch';
import genAI from '../services/geminiClient.js';
import { admin, firestore } from '../config/firebaseAdmin.js';

const router = express.Router();

const ensureFirestoreConfigured = (res) => {
  if (!firestore) {
    res.status(500).json({
      success: false,
      error: 'Firestore is not configured on the server. Please supply Firebase Admin credentials.',
    });
    return false;
  }
  return true;
};

const loadResourceAndText = async (id) => {
  const resourceRef = firestore.collection('classified_resources').doc(id);
  const snapshot = await resourceRef.get();

  if (!snapshot.exists) {
    const error = new Error('Resource not found.');
    error.status = 404;
    throw error;
  }

  const resourceData = snapshot.data();
  const file = resourceData.file || {};
  const fileUrl = file.url;
  const mimeType = file.mimeType || '';

  if (!fileUrl) {
    const error = new Error('Resource file URL is missing.');
    error.status = 400;
    throw error;
  }

  let extractedText = '';

  try {
    if (mimeType.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf')) {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        const error = new Error(`Failed to download PDF (status ${response.status})`);
        error.status = 500;
        throw error;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text || '';
    } else {
      const title = resourceData.title || '';
      const description = resourceData.description || '';
      extractedText = `${title}\n\n${description}`;
    }
  } catch (downloadError) {
    console.error('❌ Failed to extract text from resource file:', downloadError);
    const error = new Error('Failed to extract text from resource file.');
    error.status = 500;
    throw error;
  }

  if (!extractedText.trim()) {
    const error = new Error('No readable text could be extracted from this resource.');
    error.status = 400;
    throw error;
  }

  return { resourceData, extractedText };
};

const getServerTimestamp = () =>
  admin?.firestore?.FieldValue?.serverTimestamp
    ? admin.firestore.FieldValue.serverTimestamp()
    : new Date();

const buildBaseAIPayload = (resourceId, resourceData) => ({
  resourceId,
  placement: resourceData.placement || null,
  college: resourceData.college || null,
  department: resourceData.department || null,
  year: resourceData.year || null,
  semester: resourceData.semester || null,
  course: resourceData.course || null,
});

const extractJson = (text) => {
  const cleaned = text.trim().replace(/```json|```/gi, '').trim();

  const tryParse = (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  };

  const direct = tryParse(cleaned);
  if (direct !== null) {
    return direct;
  }

  const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
  if (match) {
    const matched = tryParse(match[0]);
    if (matched !== null) {
      return matched;
    }
  }

  throw new Error('Gemini did not return valid JSON.');
};

router.get('/resources/:id/ai', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;

    const aiDocRef = firestore.collection('resource_ai_metadata').doc(id);
    const docSnapshot = await aiDocRef.get();

    if (!docSnapshot.exists) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const data = docSnapshot.data();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Failed to fetch AI metadata:', error);
    return res.status(500).json({ success: false, error: 'Failed to load AI metadata.' });
  }
});

router.post('/resources/:id/ai/summary', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;

    const { resourceData, extractedText } = await loadResourceAndText(id);
    const trimmedText = extractedText.slice(0, 20000);

    const prompt = `You are an academic assistant helping university students understand course materials.

Given the following resource content, generate a structured summary with:
- shortSummary: 2-4 sentences, simple language.
- longSummary: multi-section explanation with headings and bullet points where helpful.

Return ONLY valid JSON in this exact shape:
{
  "shortSummary": string,
  "longSummary": string
}

Resource content starts below:
--------------------\n${trimmedText}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const summaryJson = extractJson(text);

    const summaryShort = typeof summaryJson?.shortSummary === 'string'
      ? summaryJson.shortSummary.trim()
      : '';
    const summaryLong = typeof summaryJson?.longSummary === 'string'
      ? summaryJson.longSummary.trim()
      : '';

    if (!summaryShort && !summaryLong) {
      throw new Error('Gemini did not return summary content.');
    }

    const aiDocRef = firestore.collection('resource_ai_metadata').doc(id);
    const existing = await aiDocRef.get();

    const aiPayload = {
      ...buildBaseAIPayload(id, resourceData),
      summaryShort,
      summaryLong,
      updatedAt: getServerTimestamp(),
    };

    if (!existing.exists) {
      aiPayload.createdAt = getServerTimestamp();
    }

    await aiDocRef.set(aiPayload, { merge: true });

    return res.status(200).json({
      success: true,
      data: {
        summaryShort,
        summaryLong,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('❌ Gemini summary error:', err);
    return res.status(status).json({ success: false, error: err.message || 'Failed to generate summary.' });
  }
});

router.post('/resources/:id/ai/flashcards', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;

    const { resourceData, extractedText } = await loadResourceAndText(id);
    const trimmedText = extractedText.slice(0, 25000);

    const prompt = `You are an academic AI assistant creating spaced-repetition flashcards for university-level study.

Using the resource content below, generate between 20 and 40 diverse flashcards covering key concepts, definitions, formulas, problem-solving prompts, and real-world applications. Each flashcard must have:
- front: a short prompt, keyword, question, or scenario (max 180 characters)
- back: a clear explanation or answer (max 400 characters)

Return ONLY JSON in this exact structure:
{
  "flashcards": [
    { "front": "...", "back": "..." }
  ]
}

Resource content starts below:
--------------------
${trimmedText}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const flashcardJson = extractJson(text);

    let rawFlashcards = [];
    if (Array.isArray(flashcardJson?.flashcards)) {
      rawFlashcards = flashcardJson.flashcards;
    } else if (Array.isArray(flashcardJson)) {
      rawFlashcards = flashcardJson;
    }

    if (!Array.isArray(rawFlashcards) || rawFlashcards.length === 0) {
      throw new Error('Gemini did not return flashcards.');
    }

    const flashcards = rawFlashcards
      .map((card, index) => {
        const front = typeof card?.front === 'string' ? card.front.trim() : '';
        const back = typeof card?.back === 'string' ? card.back.trim() : '';

        if (!front || !back) {
          return null;
        }

        return {
          id: card?.id ? String(card.id) : `fc-${index + 1}`,
          front,
          back,
        };
      })
      .filter(Boolean)
      .slice(0, 40);

    if (flashcards.length === 0) {
      throw new Error('Gemini did not return valid flashcards.');
    }

    const aiDocRef = firestore.collection('resource_ai_metadata').doc(id);
    const existing = await aiDocRef.get();

    const aiPayload = {
      ...buildBaseAIPayload(id, resourceData),
      flashcards,
      flashcardsGeneratedAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    };

    if (!existing.exists) {
      aiPayload.createdAt = getServerTimestamp();
    }

    await aiDocRef.set(aiPayload, { merge: true });

    return res.status(200).json({
      success: true,
      data: {
        flashcards,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('❌ Gemini flashcards error:', err);
    return res.status(status).json({ success: false, error: err.message || 'Failed to generate flashcards.' });
  }
});

export default router;