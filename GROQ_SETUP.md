# Groq AI Setup Guide

The application now uses **Groq** for AI features (summaries, flashcards, Q&A). Groq provides a generous **free tier** with fast inference.

## Setup Steps

### 1. Get Your Free Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Navigate to [API Keys](https://console.groq.com/keys)
4. Click "Create API Key"
5. Copy your API key

### 2. Configure Your Server

1. Open `server/.env` (create it if it doesn't exist)
2. Add your Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

3. (Optional) You can also customize the model:

```env
GROQ_DEFAULT_MODEL=llama-3.1-70b-versatile
```

### 3. Restart Your Server

```bash
cd server
npm start
```

## Available Models (Free Tier)

- `llama-3.1-70b-versatile` (default) - Best for general tasks
- `llama-3.1-8b-instant` - Faster, good for simple tasks
- `mixtral-8x7b-32768` - Good for longer contexts
- `gemma2-9b-it` - Efficient alternative

## Free Tier Limits

- 30 requests per minute
- 14,400 requests per day
- More than enough for typical usage!

## Troubleshooting

If you get errors:
1. Make sure your API key is correct in `server/.env`
2. Restart the server after adding the key
3. Check that you haven't exceeded rate limits
4. Verify your account is active at https://console.groq.com

## What Changed?

- Switched from OpenRouter (paid) to Groq (free)
- All AI features work the same way
- Faster inference times
- No credit card required
