import { NextRequest, NextResponse } from 'next/server';
import { findHelp } from '@/components/help/cloudy-knowledge';
import { assistantKnowledge, isVagueHelpRequest, sanitizeAssistantHistory } from '@/lib/cloudy-chat-context';
import { assistantIdentityReply } from '@/lib/assistant-identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RAILWAY_ENDPOINT = 'https://cloudy-production-b24f.up.railway.app/api/website-assistant/chat';
const ipRequests = new Map<string, { count: number; expiresAt: number }>();

function respond(payload: object, status = 200) {
  return NextResponse.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}

function allowRequest(request: NextRequest) {
  const now = Date.now();
  if (ipRequests.size > 1200) {
    for (const [ip, entry] of ipRequests) if (entry.expiresAt <= now) ipRequests.delete(ip);
    if (ipRequests.size > 1200) ipRequests.clear();
  }
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || 'unknown';
  const ip = forwarded.split(',')[0].trim().slice(0, 64);
  const entry = ipRequests.get(ip);
  if (!entry || entry.expiresAt <= now) {
    ipRequests.set(ip, { count: 1, expiresAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 8) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  if (!allowRequest(request)) return respond({ error: 'Please wait a moment before sending another message.' }, 429);

  const secret = process.env.CLOUDY_ASSISTANT_SHARED_SECRET;
  if (!secret || secret.length < 32) return respond({ error: 'Assistant is temporarily unavailable.' }, 503);

  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 8_000) return respond({ error: 'Message is too long.' }, 413);
    input = JSON.parse(raw);
  } catch {
    return respond({ error: 'Invalid message.' }, 400);
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return respond({ error: 'Invalid message.' }, 400);
  }
  const data = input as Record<string, unknown>;
  const question = typeof data.question === 'string' ? data.question.trim() : '';
  if (question.length < 2 || question.length > 1000 || !Array.isArray(data.history)) {
    return respond({ error: 'Enter a question under 1,000 characters.' }, 400);
  }

  const history = sanitizeAssistantHistory(data.history);
  const identity = assistantIdentityReply(question);
  if (identity) return respond({ answer: identity, links: [] });
  // A vague request for help is a conversation opener, not a request for
  // the support website. Clarify it without spamming links or consuming AI.
  if (isVagueHelpRequest(question)) {
    const dutch = /\b(?:ik|hulp|ondersteuning|kun|kan|mij|je|jij)\b/i.test(question);
    return respond({
      answer: dutch
        ? 'Waarmee kan ik je helpen? Vertel me kort wat er aan de hand is.'
        : 'What do you need help with? Tell me a little about what is going on.',
      links: [],
    });
  }
  const context = assistantKnowledge(question, history, findHelp);
  const payload = { question, evidence: context.evidence, history: [...history] };
  while (payload.history.length && Buffer.byteLength(JSON.stringify(payload)) > 7_500) {
    payload.history.shift();
  }
  if (Buffer.byteLength(JSON.stringify(payload)) > 7_500) {
    return respond({ error: 'Message is too long.' }, 413);
  }

  try {
    const upstream = await fetch(RAILWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(50_000)]),
    });
    if (!upstream.ok) {
      return respond({
        error: upstream.status === 429
          ? 'Cloudy assistant is busy. Try again shortly.'
          : 'Cloudy assistant is temporarily unavailable. Please try again.',
      }, upstream.status === 429 ? 429 : 503);
    }
    const data: unknown = await upstream.json();
    if (!data || typeof data !== 'object' || typeof (data as { answer?: unknown }).answer !== 'string') {
      return respond({ error: 'Cloudy assistant is temporarily unavailable.' }, 502);
    }
    const answer = (data as { answer: string }).answer.trim().slice(0, 3500);
    if (!answer) return respond({ error: 'Cloudy assistant is temporarily unavailable.' }, 502);
    return respond({ answer, links: context.links, source: context.source });
  } catch {
    return respond({ error: 'Could not connect to Cloudy assistant. Please try again.' }, 503);
  }
}
