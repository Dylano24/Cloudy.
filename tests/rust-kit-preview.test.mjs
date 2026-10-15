import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { componentHarness, elements, textContent } from './helpers/component-harness.mjs';

function setup() {
  const harness = componentHarness();
  const { default: Preview } = loadTypeScript('components/shop/rust-kit-preview.tsx', {
    imports: { react: harness.react, 'next/link': 'a', 'next/image': 'img', '@/lib/rust-items.json': JSON.parse(readFileSync(new URL('../lib/rust-items.json', import.meta.url), 'utf8')) },
  });
  harness.mount(Preview);
  return harness;
}
const buttons = tree => elements(tree, node => node.type === 'button');

test('Buy shows a preview notice for the current server without creating a checkout link', () => {
  const h = componentHarness();
  const { KitPreviewCard } = loadTypeScript('components/shop/rust-kit-preview.tsx', {
    imports: { react: h.react, 'next/link': 'a', 'next/image': 'img', '@/lib/rust-items.json': JSON.parse(readFileSync(new URL('../lib/rust-items.json', import.meta.url), 'utf8')) },
  });
  const { previewKits } = loadTypeScript('lib/rust-kit-preview.ts', { imports: { '@/lib/rust-items.json': JSON.parse(readFileSync(new URL('../lib/rust-items.json', import.meta.url), 'utf8')) } });
  h.mount(KitPreviewCard, { kit: previewKits[0], server: 'Server 2' });
  buttons(h.tree).find(node => node.props['aria-label'] === 'Preview purchase of VIP kit').props.onClick();
  let tree = h.render();
  assert.match(textContent(elements(tree, node => node.props.role === 'status')), /VIP kit · Server 2.*purchases are not available/);
  tree = h.update({ kit: previewKits[0], server: 'Server 5' });
  assert.match(textContent(elements(tree, node => node.props.role === 'status')), /Server 5/);
  assert.equal(elements(tree, node => node.type === 'a' || node.type === 'form').length, 0);
});

test('choosing any of the five servers updates every visible kit without adding products to a cart', () => {
  const h = setup();
  for (let server = 1; server <= 5; server++) {
    const choice = buttons(h.tree).find(node => node.props['aria-label'] === `Select Server ${server}`);
    assert.ok(choice);
    choice.props.onClick();
    const tree = h.render();
    assert.equal(buttons(tree).filter(node => node.props['aria-pressed'] && node.props['aria-label']?.startsWith('Select Server')).length, 1);
    const cards = elements(tree, node => node.props.kit && node.props.server);
    assert.equal(cards.length, 6);
    assert.ok(cards.every(card => card.props.server === `Server ${server}`));
    assert.equal(elements(tree, node => node.props.href?.includes('/cart') || node.props.href?.includes('/checkout')).length, 0);
  }
});

test('search and category work together, with a recovery action for empty results', () => {
  const h = setup();
  const search = elements(h.tree, node => node.type === 'input')[0];
  search.props.onChange({ target: { value: 'Medical Syringe' } });
  let tree = h.render();
  assert.ok(elements(tree, node => node.props.kit).length > 0);
  buttons(tree).find(node => textContent(node) === 'Claim once').props.onClick();
  tree = h.render();
  assert.ok(textContent(tree).includes('No kits found'));
  buttons(tree).find(node => textContent(node).includes('Reset filters')).props.onClick();
  tree = h.render();
  assert.equal(elements(tree, node => node.props.kit).length, 6);
});

test('purchase-type categories each show their own two kits and retain server selection', () => {
  const h = setup();
  buttons(h.tree).find(node => node.props['aria-label'] === 'Select Server 5').props.onClick();
  h.render();
  for (const name of ['Subscriptions', 'Claim once', 'Lifetime']) {
    buttons(h.tree).find(node => textContent(node) === name).props.onClick();
    const tree = h.render();
    const cards = elements(tree, node => node.props.kit && node.props.server);
    assert.equal(cards.length, 2);
    assert.ok(cards.every(card => card.props.kit.category === name && card.props.server === 'Server 5'));
  }
});

test('every inventory item has a canonical Rust name, a local image and a valid slot', () => {
  const catalog = JSON.parse(readFileSync(new URL('../lib/rust-items.json', import.meta.url), 'utf8'));
  const { previewKits } = loadTypeScript('lib/rust-kit-preview.ts', { imports: { '@/lib/rust-items.json': catalog } });
  const capacities = { wear: 7, main: 12, belt: 6 };
  for (const kit of previewKits) {
    assert.ok(kit.price > 0, 'Preview prices must be positive proposals');
    for (const [area, capacity] of Object.entries(capacities)) {
      assert.ok(kit.items.filter(item => item.area === area).length <= capacity, `${kit.id}: no hidden items`);
    }
    for (const item of kit.items) {
      const entry = catalog[item.shortname];
      assert.ok(entry?.name && entry.source.startsWith('https://wiki.facepunch.com/rust/item/'));
      assert.ok(Number.isInteger(item.amount) && item.amount > 0);
      const image = readFileSync(new URL('../public' + entry.image, import.meta.url));
      assert.equal(image.readUInt32BE(0), 0x89504e47, entry.name);
    }
  }
});
