import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined. Please add it to server/.env and restart the server.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;