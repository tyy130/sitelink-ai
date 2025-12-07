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

    // Try a small retry/backoff strategy for transient 429 or 5xx errors from OpenAI
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000; // 1s

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const upstreamRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(req.body),
        });

        // If OpenAI wants us to retry, consult headers or status code
        if (upstreamRes.status === 429 || upstreamRes.status >= 500) {
          const retryAfter = upstreamRes.headers.get('retry-after');
          const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`OpenAI returned ${upstreamRes.status}. attempt=${attempt} retry-after=${retryAfter} waiting=${waitMs}ms`);

          if (attempt < MAX_RETRIES) {
            await sleep(waitMs + Math.floor(Math.random() * 200));
            continue; // retry loop
          }
          // last attempt - pass through the response body
          const errorText = await upstreamRes.text();
          const contentType = upstreamRes.headers.get('content-type') || 'text/plain';
          res.status(upstreamRes.status).setHeader('Content-Type', contentType).send(errorText);
          return;
        }

        // success (2xx/3xx) or other non-retryable status
        const data = await upstreamRes.text();
        const contentType = upstreamRes.headers.get('content-type') || 'application/json';
        res.status(upstreamRes.status).setHeader('Content-Type', contentType).send(data);
        return;
      } catch (err) {
        console.warn('Upstream fetch failed (network)', attempt, err && err.message);
        lastError = err;
        if (attempt < MAX_RETRIES) {
          const waitMs = BASE_DELAY_MS * Math.pow(2, attempt);
          await sleep(waitMs + Math.floor(Math.random() * 200));
          continue;
        }
      }
    }

    console.error('OpenAI proxy: all retries failed', lastError);
    res.status(502).json({ error: 'Failed to reach OpenAI after retries', details: String(lastError) });
  } catch (err) {
    console.error('proxy error', err);
    res.status(500).json({ error: String(err) });
  }
}
