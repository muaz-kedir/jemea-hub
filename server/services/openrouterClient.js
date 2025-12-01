import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Using Groq for free AI inference
const GROQ_BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').trim();
const GROQ_DEFAULT_MODEL = (process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile').trim();

const getHeaders = () => {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) {
    const err = new Error('GROQ_API_KEY is not defined. Please add it to server/.env and restart the server. Get a free key at https://console.groq.com/keys');
    err.status = 500;
    throw err;
  }
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
};

export async function chatCompletions({ messages, model, max_tokens, temperature, top_p }) {
  const body = {
    model: model || GROQ_DEFAULT_MODEL,
    messages,
    max_tokens,
    temperature,
    top_p,
  };

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(`Groq API error ${res.status}: ${text || res.statusText}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export default {
  chatCompletions,
};
