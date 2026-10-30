import { getBotHealth, isBotApiConfigured } from '@/lib/bot-dashboard/bot-api';

// Public: Cloudy's own /health summary plus whether the Dashboard API is linked.
export async function GET() {
  const health = await getBotHealth();
  return Response.json(
    { ...health, dashboardApi: isBotApiConfigured() ? 'connected' : 'not_connected' },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30', 'X-Content-Type-Options': 'nosniff' } },
  );
}
