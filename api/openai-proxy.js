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

    // Basic per-client token-bucket rate-limiter to prevent bursts from a single client
    // NOTE: this is an in-memory limiter (per serverless instance). For production use
    // with multiple instances you should use a central store (Redis, Upstash) for global limits.
    const RATE_LIMIT_CAPACITY = parseInt(process.env.RATE_LIMIT_CAPACITY || '6', 10); // max tokens
    const RATE_LIMIT_REFILL_PER_SEC = parseFloat(process.env.RATE_LIMIT_REFILL_PER_SEC || '1'); // tokens per second

    const forwardedFor = (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'])) || req.socket && req.socket.remoteAddress || 'unknown';
    const clientKey = String(forwardedFor).split(',')[0].trim() || 'unknown';

    // token-buckets per client (in-memory)
    if (!globalThis.__tokenBuckets) globalThis.__tokenBuckets = new Map();
    const buckets = globalThis.__tokenBuckets;

    function getBucket(key) {
      const now = Date.now();
      let b = buckets.get(key);
      if (!b) {
        b = { tokens: RATE_LIMIT_CAPACITY, last: now };
        buckets.set(key, b);
      }
      // refill
      const elapsed = (now - b.last) / 1000.0;
      if (elapsed > 0) {
        b.tokens = Math.min(RATE_LIMIT_CAPACITY, b.tokens + elapsed * RATE_LIMIT_REFILL_PER_SEC);
        b.last = now;
      }
      return b;
    }

    const bucket = getBucket(clientKey);
    if (bucket.tokens < 1) {
      // calculate approximate wait seconds until one token becomes available
      const waitSeconds = Math.ceil((1 - bucket.tokens) / RATE_LIMIT_REFILL_PER_SEC);
      res.setHeader('Retry-After', String(waitSeconds));
      res.status(429).json({ error: 'Rate limit exceeded. Try again later.', retry_after_seconds: waitSeconds });
      return;
    }
    // consume a token
    bucket.tokens -= 1;

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
