// Which Tip4Serv product sells each Rust kit, by its product link name (slug):
//   CLOUDY_KIT_PRODUCTS {"assault": "vip-kit", "builder": "builder-kit"}
// A kit with a product opens its real product page (add to basket, checkout).
// A kit without one is shown as not on sale yet.

const SLUG = /^[A-Za-z0-9_-]{1,150}$/;

export function kitProductSlugs(env: Record<string, string | undefined> = process.env): Record<string, string> {
  try {
    const parsed = JSON.parse(env.CLOUDY_KIT_PRODUCTS || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([kit, slug]) => /^[a-z0-9_-]{1,40}$/.test(kit) && typeof slug === 'string' && SLUG.test(slug)) as [string, string][]);
  } catch {
    return {};
  }
}
