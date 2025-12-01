import express from 'express';
import pdfParse from 'pdf-parse';
import fetch from 'node-fetch';
import { chatCompletions } from '../services/openrouterClient.js';

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

const generateText = async (prompt) => {
  const model = (process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile').trim();
  const response = await chatCompletions({
    model,
    messages: [
      { role: 'user', content: prompt },
    ],
  });
  const text = response?.choices?.[0]?.message?.content || '';
  if (!text) {
    const error = new Error('AI did not return content.');
    error.status = 502;
    throw error;
  }
  return text;
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
  console.log('🔍 Raw AI response length:', text.length);
  
  // Remove all markdown code blocks (backticks)
  let cleaned = text.trim();
  // Remove opening backticks with optional json label
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  // Remove closing backticks
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  const tryParse = (value) => {
    try {
      const parsed = JSON.parse(value);
      console.log('✅ Parsed JSON successfully');
      return parsed;
    } catch (error) {
      console.log('❌ JSON parse error:', error.message);
      return null;
    }
  };

  // First try parsing directly
  let result = tryParse(cleaned);
  if (result !== null) return result;

  // Try to find JSON object in the text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    result = tryParse(match[0]);
    if (result !== null) return result;
  }

  // Fix newlines inside JSON string values only (not structural newlines)
  // This regex finds content between quotes and escapes newlines there
  const fixNewlinesInStrings = (jsonStr) => {
    return jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    });
  };

  const fixed = fixNewlinesInStrings(cleaned);
  result = tryParse(fixed);
  if (result !== null) return result;

  if (match) {
    const fixedMatch = fixNewlinesInStrings(match[0]);
    result = tryParse(fixedMatch);
    if (result !== null) return result;
  }

  console.error('❌ Failed to extract JSON. Cleaned text:', cleaned.substring(0, 500));
  throw new Error('AI did not return valid JSON.');
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

    const prompt = `You are an expert academic assistant helping university students deeply understand course materials.

Given the following resource content, generate a comprehensive and detailed summary with:

1. shortSummary: A concise 3-5 sentence overview that captures the main topic, key concepts, and importance of the material.

2. longSummary: A thorough, well-structured explanation that includes:
   - An introduction explaining what the document covers
   - Multiple sections with clear headings (use ## for headings)
   - Detailed explanations of all key concepts, theories, and definitions
   - Important formulas, methods, or processes if applicable
   - Real-world applications or examples
   - Relationships between different concepts
   - Key takeaways and conclusions
   - Use bullet points (- ) for lists
   - Make it comprehensive enough that a student could use it as study notes

IMPORTANT: Return ONLY valid JSON. Do not include any newlines within the string values - use spaces instead.

Return in this exact JSON format:
{
  "shortSummary": "your short summary here as a single line",
  "longSummary": "your detailed summary here with ## for headings and - for bullets, all on a single line"
}

Resource content starts below:
--------------------
${trimmedText}`;

    const text = await generateText(prompt);

    const summaryJson = extractJson(text);

    const summaryShort = typeof summaryJson?.shortSummary === 'string'
      ? summaryJson.shortSummary.trim()
      : '';
    const summaryLong = typeof summaryJson?.longSummary === 'string'
      ? summaryJson.longSummary.trim()
      : '';

    if (!summaryShort && !summaryLong) {
      throw new Error('AI did not return summary content.');
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
    console.error('❌ AI summary error:', err);
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
--------------------\n${trimmedText}`;

    const text = await generateText(prompt);

    const flashcardJson = extractJson(text);

    let rawFlashcards = [];
    if (Array.isArray(flashcardJson?.flashcards)) {
      rawFlashcards = flashcardJson.flashcards;
    } else if (Array.isArray(flashcardJson)) {
      rawFlashcards = flashcardJson;
    }

    if (!Array.isArray(rawFlashcards) || rawFlashcards.length === 0) {
      throw new Error('AI did not return flashcards.');
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
      throw new Error('AI did not return valid flashcards.');
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
    console.error('❌ AI flashcards error:', err);
    return res.status(status).json({ success: false, error: err.message || 'Failed to generate flashcards.' });
  }
});

// Chat with PDF endpoint
router.post('/resources/:id/ai/chat', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;
    const { question, chatHistory = [] } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    const { resourceData, extractedText } = await loadResourceAndText(id);
    const trimmedText = extractedText.slice(0, 15000);

    // Build conversation history for context
    const historyContext = chatHistory.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const prompt = `You are an expert academic tutor helping a university student understand a document. Your role is to:
- Provide clear, detailed, and accurate explanations based on the document content
- Use examples and analogies to make complex concepts easier to understand
- If the question is not related to the document, politely redirect to document-related topics
- Format your response with clear structure using paragraphs, bullet points, or numbered lists when helpful
- Be encouraging and supportive in your teaching style

DOCUMENT CONTENT:
--------------------
${trimmedText}
--------------------

${historyContext ? `PREVIOUS CONVERSATION:\n${historyContext}\n\n` : ''}STUDENT'S QUESTION: ${question.trim()}

Provide a helpful, detailed response based on the document content above:`;

    const model = (process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile').trim();
    const response = await chatCompletions({
      model,
      messages: [
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const answer = response?.choices?.[0]?.message?.content || '';
    
    if (!answer) {
      throw new Error('AI did not return a response.');
    }

    console.log('✅ Chat response generated for resource:', id);

    return res.status(200).json({
      success: true,
      data: {
        answer: answer.trim(),
        resourceId: id,
        resourceTitle: resourceData.title || 'Untitled',
      },
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('❌ AI chat error:', err);
    return res.status(status).json({ success: false, error: err.message || 'Failed to get response.' });
  }
});

export default router;