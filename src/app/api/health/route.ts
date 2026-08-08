import { NextResponse } from 'next/server';

export async function GET() {
  const isMock = process.env.MOCK_MODE === 'true';
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const hasCloudflare = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) || Boolean(process.env.CLOUDFLARE_WORKER_URL);

  const aiStatus = isMock || hasOpenRouter || hasCloudflare ? 'online' : 'degraded';

  return NextResponse.json({
    status: aiStatus === 'online' ? 'ok' : 'degraded',
    service: 'AI HUB',
    ai: aiStatus,
    timestamp: new Date().toISOString(),
  });
}
