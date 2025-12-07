export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).setHeader('Allow','POST').send('Method Not Allowed');
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing OpenAI API key' });
      return;
    }

    const upstreamRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstreamRes.text();
    // mirror status and content-type
    const contentType = upstreamRes.headers.get('content-type') || 'application/json';
    res.status(upstreamRes.status).setHeader('Content-Type', contentType).send(data);
  } catch (err) {
    console.error('proxy error', err);
    res.status(500).json({ error: String(err) });
  }
}
