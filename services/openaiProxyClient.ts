import OpenAI from "openai";

const isServer = typeof window === 'undefined';

const API_URL = isServer
  ? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/openai-proxy`
    : process.env.NETLIFY ? `/.netlify/functions/openai-proxy` : '/api/openai-proxy'
  : '/api/openai-proxy';

const useProxy = isServer || process.env.NODE_ENV === 'production';

const openai = useProxy
  ? {
      chat: {
        completions: {
          create: async (payload) => {
            const res = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Proxy error: ' + res.status);
            return await res.json();
          },
        },
      },
    }
  : new OpenAI({
      apiKey: process.env.API_KEY,
      dangerouslyAllowBrowser: true,
    });

export default openai;
