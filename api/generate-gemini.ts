// api/generate-gemini.ts — server-side proxy for Google Gemini (GenAI)
// Requires GEMINI_API_KEY to be set in environment (Vercel env or .env.local for dev)

declare const process: any;

import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server GEMINI_API_KEY not configured' });

  const { model, niche, temperature, quantity } = req.body || {};
  if (!model) return res.status(400).json({ error: 'Missing model in request' });

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model,
      contents: `Generate ${quantity || 1} unique variations of stock photo metadata for the niche: "${niche || ''}".`,
      config: {
        temperature: temperature ?? 0.7,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    res.status(200).send(text);
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    res.status(500).json({ error: 'Gemini proxy request failed' });
  }
}
