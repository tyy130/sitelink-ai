import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new NextResponse('Missing OpenAI API key', { status: 500 });
  }

  const body = await req.json();

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await openaiRes.json();
  return NextResponse.json(data, { status: openaiRes.status });
}
