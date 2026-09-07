import { NextResponse } from 'next/server';
import { z } from 'zod';

const appealSchema = z.object({
  scope: z.enum(['discord', 'rust']),
  action: z.enum(['Mute', 'Ban', 'Other']),
  discordIdentity: z.string().trim().min(2).max(100),
  gamertag: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  punishmentReason: z.string().trim().min(10).max(2000),
  punishmentJustified: z.string().trim().min(10).max(2000),
  acceptanceReason: z.string().trim().min(10).max(2000),
  futureChanges: z.string().trim().min(10).max(2000),
  evidence: z.string().trim().max(2000).optional().default(''),
  additionalInfo: z.string().trim().max(2000).optional().default(''),
});

function clip(value: string, max = 1000) {
  const clean = value.trim();
  if (!clean) return 'Not provided';
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = appealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Please complete every required field correctly.' }, { status: 400 });
    }

    const webhookUrl = process.env.APPEALS_DISCORD_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Appeal submissions are temporarily unavailable. Please contact Cloudy staff in Discord.' },
        { status: 503 },
      );
    }

    const appeal = parsed.data;
    const id = `CLD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const scopeLabel = appeal.scope === 'discord' ? 'Discord' : 'Rust server';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Cloudy Appeals',
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: `${scopeLabel} appeal — ${appeal.action}`,
            color: 0x35bdf6,
            description: `A new appeal was submitted through the Cloudy website.\n\n**Appeal ID:** ${id}`,
            fields: [
              { name: 'Discord username / ID', value: clip(appeal.discordIdentity), inline: true },
              { name: 'Gamertag', value: clip(appeal.gamertag), inline: true },
              { name: 'Email', value: clip(appeal.email), inline: false },
              { name: 'Why were you muted/banned?', value: clip(appeal.punishmentReason), inline: false },
              { name: 'Was the punishment justified?', value: clip(appeal.punishmentJustified), inline: false },
              { name: 'Why should the appeal be accepted?', value: clip(appeal.acceptanceReason), inline: false },
              { name: 'What will they do differently?', value: clip(appeal.futureChanges), inline: false },
              { name: 'Evidence', value: clip(appeal.evidence), inline: false },
              { name: 'Additional information', value: clip(appeal.additionalInfo), inline: false },
            ],
            footer: { text: `Cloudy Inc. • ${id}` },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Appeals] Discord webhook rejected submission', response.status, await response.text().catch(() => ''));
      return NextResponse.json(
        { error: 'Your appeal could not be delivered to staff. Please try again in a moment.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('[Appeals] Submission failed', error);
    return NextResponse.json(
      { error: 'Your appeal could not be submitted. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
