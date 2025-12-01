import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const OPENROUTER_BASE_URL = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').trim();
const OPENROUTER_DEFAULT_MODEL = (process.env.OPENROUTER_DEFAULT_MODEL || '').trim();

const getHeaders = () => {
  const key = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!key) {
    const err = new Error('OPENROUTER_API_KEY is not defined. Please add it to server/.env and restart the server.');
    err.status = 500;
    throw err;
  }
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
};

export async function chatCompletions({ messages, model, max_tokens, temperature, top_p, presence_penalty, frequency_penalty, response_format }) {
  const body = {
    model: model || OPENROUTER_DEFAULT_MODEL || undefined,
    messages,
    max_tokens,
    temperature,
    top_p,
    presence_penalty,
    frequency_penalty,
    response_format,
  };

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(`OpenRouter error ${res.status}: ${text || res.statusText}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export default {
  chatCompletions,
};
