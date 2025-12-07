import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).setHeader('Allow','POST').send('Method Not Allowed');
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing Gemini API key (GEMINI_API_KEY)' });
      return;
    }

    // Basic per-client token-bucket limiter (per instance)
    const RATE_LIMIT_CAPACITY = parseInt(process.env.RATE_LIMIT_CAPACITY || '6', 10);
    const RATE_LIMIT_REFILL_PER_SEC = parseFloat(process.env.RATE_LIMIT_REFILL_PER_SEC || '1');

    const forwardedFor = (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'])) || req.socket && req.socket.remoteAddress || 'unknown';
    const clientKey = String(forwardedFor).split(',')[0].trim() || 'unknown';

    if (!globalThis.__tokenBuckets) globalThis.__tokenBuckets = new Map();
    const buckets = globalThis.__tokenBuckets;

    function getBucket(key) {
      const now = Date.now();
      let b = buckets.get(key);
      if (!b) {
        b = { tokens: RATE_LIMIT_CAPACITY, last: now };
        buckets.set(key, b);
      }
      const elapsed = (now - b.last) / 1000.0;
      if (elapsed > 0) {
        b.tokens = Math.min(RATE_LIMIT_CAPACITY, b.tokens + elapsed * RATE_LIMIT_REFILL_PER_SEC);
        b.last = now;
      }
      return b;
    }

    const bucket = getBucket(clientKey);
    if (bucket.tokens < 1) {
      const waitSeconds = Math.ceil((1 - bucket.tokens) / RATE_LIMIT_REFILL_PER_SEC);
      res.setHeader('Retry-After', String(waitSeconds));
      res.status(429).json({ error: 'Rate limit exceeded. Try again later.', retry_after_seconds: waitSeconds });
      return;
    }

    // Concurrency slot (per instance)
    const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY_PER_INSTANCE || '2', 10);
    const MAX_QUEUE = parseInt(process.env.MAX_QUEUE_PER_INSTANCE || '16', 10);
    const QUEUE_TIMEOUT_MS = parseInt(process.env.QUEUE_TIMEOUT_MS || '10000', 10);

    if (!globalThis.__openaiProxyInstance) globalThis.__openaiProxyInstance = { active: 0, queue: [] };
    const instance = globalThis.__openaiProxyInstance;

    const acquireSlot = () => new Promise((resolve, reject) => {
      if (instance.active < MAX_CONCURRENCY) { instance.active += 1; resolve(true); return; }
      if (instance.queue.length >= MAX_QUEUE) { reject(new Error('queue_full')); return; }
      let timed = false;
      const timer = setTimeout(() => { timed = true; instance.queue = instance.queue.filter(q => q !== resolver); reject(new Error('queue_timeout')); }, QUEUE_TIMEOUT_MS);
      const resolver = () => { if (timed) return; clearTimeout(timer); instance.active += 1; resolve(true); };
      instance.queue.push(resolver);
    });
    const releaseSlot = () => { instance.active = Math.max(0, instance.active - 1); const next = instance.queue.shift(); if (typeof next === 'function') next(); };

    try { await acquireSlot(); } catch (err) {
      if (err.message === 'queue_full' || err.message === 'queue_timeout') {
        res.setHeader('Retry-After', String(Math.ceil(QUEUE_TIMEOUT_MS/1000)));
        res.status(429).json({ error: 'Server busy. Try again later.', retry_after_seconds: Math.ceil(QUEUE_TIMEOUT_MS/1000) });
        return;
      }
      res.status(503).json({ error: 'Server busy' });
      return;
    }

    // Recheck tokens and consume
    const freshBucket = getBucket(clientKey);
    if (freshBucket.tokens < 1) { releaseSlot(); const waitSeconds = Math.ceil((1 - freshBucket.tokens) / RATE_LIMIT_REFILL_PER_SEC); res.setHeader('Retry-After', String(waitSeconds)); res.status(429).json({ error: 'Rate limit exceeded. Try again later.', retry_after_seconds: waitSeconds }); return; }
    freshBucket.tokens -= 1;

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });
    const MODEL = req.body.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Build prompt/content
    let prompt = '';
    if (Array.isArray(req.body.messages)) {
      prompt = req.body.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    } else if (typeof req.body.contents === 'string') {
      prompt = req.body.contents;
    } else if (typeof req.body.prompt === 'string') {
      prompt = req.body.prompt;
    } else {
      prompt = JSON.stringify(req.body).slice(0, 4000);
    }

    // Retry/backoff for Gemini
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let lastErr = null;

    for (let attempt=0; attempt<=MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({ model: MODEL, contents: prompt, config: { responseMimeType: 'application/json' } });
        // extract text
        if (response && response.text) {
          try { res.setHeader('Content-Type', 'application/json'); res.status(200).send(response.text); } finally { releaseSlot(); }
          return;
        }
        const text = response.text || JSON.stringify(response);
        try { res.setHeader('Content-Type', 'application/json'); res.status(200).send(text); } finally { releaseSlot(); }
        return;
      } catch (err) {
        lastErr = err;
        const status = err && err.status ? err.status : null;
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          const waitMs = BASE_DELAY_MS * Math.pow(2, attempt);
          await sleep(waitMs + Math.floor(Math.random()*200));
          continue;
        }
        console.error('gemini proxy failed', err);
        try { res.status(502).json({ error: 'Gemini proxy failure', details: String(err) }); } finally { releaseSlot(); }
        return;
      }
    }

    // fallback
    try { res.status(502).json({ error: 'Gemini proxy failed after retries', details: String(lastErr) }); } finally { releaseSlot(); }

  } catch (err) {
    console.error('gemini-proxy error', err);
    res.status(500).json({ error: String(err) });
  }
}
