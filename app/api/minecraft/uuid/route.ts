import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }
  // Minecraft names are 3-16 letters, digits or underscores; nothing else may reach the upstream URL path.
  if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
    return NextResponse.json(
      { error: 'Minecraft username not found' },
      { status: 404 }
    );
  }

  try {
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Minecraft username not found' },
          { status: 404 }
        );
      }
      throw new Error(`Mojang API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ uuid: data.id });
  } catch (error) {
    console.error('Error fetching Minecraft UUID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Minecraft UUID' },
      { status: 500 }
    );
  }
}
