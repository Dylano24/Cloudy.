import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

test('normal Rust links and existing kit links both open the approved kit store', async () => {
  const KitStore = () => null;
  const { default: ShopPage } = loadTypeScript('app/shop/page.tsx', {
    imports: {
      'next/link': 'a',
      '@/components/shop/rust-store': () => null,
      '@/components/shop/rust-kit-preview': KitStore,
      '@/components/shop/store-fireworks': { StoreFireworks: () => null },
      '@/components/shop/store-panel-sync': { StorePanelSync: () => null },
      '@/components/home/game-carousel': { GameCarousel: () => null },
    },
  });
  for (const params of [{ game: 'rust' }, { game: 'rust', view: 'kits' }]) {
    const page = await ShopPage({ searchParams: Promise.resolve(params) });
    assert.equal(page.type, KitStore);
  }
  const overview = await ShopPage({ searchParams: Promise.resolve({}) });
  assert.equal(overview.type, 'main');
});
