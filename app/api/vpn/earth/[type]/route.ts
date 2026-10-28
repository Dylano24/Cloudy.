import { NextResponse } from "next/server";

/**
 * Same-origin, cached proxy for public Earth texture imagery.
 * Fixed allowlist only: never accept arbitrary upstream URLs.
 * Imagery sources: NASA-derived Earth textures distributed with three.js examples.
 */
const ASSETS = {
  day: "earth_day_4096.jpg",
  night: "earth_night_4096.jpg",
} as const;
const SOURCES = [
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/",
  "https://threejs.org/examples/textures/planets/",
] as const;
const MONTH = 60 * 60 * 24 * 30;

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  if (type !== "day" && type !== "night") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filename = ASSETS[type];
  for (const host of SOURCES) {
    try {
      const response = await fetch(host + filename, {
        next: { revalidate: MONTH },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("image/") && !contentType.includes("octet-stream")) continue;
      const blob = await response.arrayBuffer();
      if (blob.byteLength === 0 || blob.byteLength > 5_000_000) continue;
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Continue to the alternate static source; do not fail the whole site.
    }
  }
  return NextResponse.json({ error: "Earth imagery temporarily unavailable" }, { status: 502 });
}
