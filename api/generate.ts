// api/generate.ts — server-side proxy for OpenAI requests
// Keeps the API key on the server (set OPENAI_API_KEY in Vercel / .env.local for local dev)

declare const process: any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server API key not configured' });

  // Basic request validation (adjust to your app's needs)
  const { model, messages, temperature, response_format } = req.body || {};
  if (!model || !messages) return res.status(400).json({ error: 'Missing model or messages in request body' });

  try {
    // OPTIONAL: implement rate-limiting or auth checks here

    const proxied = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages, temperature, response_format }),
    });

    const text = await proxied.text();
    // Forward status and body as-is (keeps original OpenAI structure)
    res.status(proxied.status).send(text);
  } catch (err: any) {
    console.error('OpenAI proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
