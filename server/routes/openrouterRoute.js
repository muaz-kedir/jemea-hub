import express from 'express';
import { chatCompletions } from '../services/openrouterClient.js';

const router = express.Router();
router.post('/openrouter/chat', async (req, res) => {
  try {
    const { messages, model, max_tokens, temperature, top_p, presence_penalty, frequency_penalty, response_format } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Request body must include non-empty array "messages".' });
    }

    const response = await chatCompletions({
      messages,
      model,
      max_tokens,
      temperature,
      top_p,
      presence_penalty,
      frequency_penalty,
      response_format,
    });

    const choice = response?.choices?.[0];
    const content = choice?.message?.content ?? null;

    return res.status(200).json({
      success: true,
      data: {
        id: response?.id,
        model: response?.model || model || null,
        content,
        usage: response?.usage || null,
      },
    });
  } catch (err) {
    const status = err?.status || 500;
    console.error('❌ OpenRouter chat error:', err);
    return res.status(status).json({ success: false, error: err?.message || 'Failed to generate response.' });
  }
});

export default router;
