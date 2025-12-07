// Vercel/Netlify compatible OpenAI proxy (Node.js)
// Place this file in /api/openai-proxy.ts
// POST requests only

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing OpenAI API key' });
    return;
  }

  const body = req.body;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await openaiRes.json();
  res.status(openaiRes.status).json(data);
}
