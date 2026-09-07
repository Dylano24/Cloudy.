import { NextResponse } from 'next/server';
import { z } from 'zod';

const BOT_APPEALS_URL = 'https://cloudy-production-b24f.up.railway.app/api/appeals';

const appealSchema = z.object({
  scope: z.enum(['discord', 'rust']),
  action: z.enum(['Mute', 'Ban', 'Other']),
  discordIdentity: z.string().trim().max(100).optional().default(''),
  gamertag: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email().max(254),
  punishmentReason: z.string().trim().min(1).max(1000),
  punishmentJustified: z.string().trim().min(1).max(1000),
  acceptanceReason: z.string().trim().min(1).max(1000),
  futureChanges: z.string().trim().min(1).max(1000),
  evidence: z.string().trim().max(1000).optional().default(''),
  additionalInfo: z.string().trim().max(1000).optional().default(''),
}).superRefine((appeal, ctx) => {
  if (appeal.scope === 'discord' && !appeal.discordIdentity) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discordIdentity'], message: 'Discord username / ID is required.' });
  }
  if (appeal.scope === 'rust' && !appeal.gamertag) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gamertag'], message: 'Gamertag is required.' });
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = appealSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Please complete every required field correctly.';
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const response = await fetch(BOT_APPEALS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cloudy-source': 'cloudy-store-appeal-v1',
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Appeals] Cloudy bot rejected submission', response.status, result);
      return NextResponse.json(
        { error: result?.error || 'Your appeal could not be delivered to staff. Please try again in a moment.' },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
      );
    }

    return NextResponse.json({ ok: true, id: String(result?.id || '') });
  } catch (error) {
    console.error('[Appeals] Submission failed', error);
    return NextResponse.json(
      { error: 'Your appeal could not be submitted. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
