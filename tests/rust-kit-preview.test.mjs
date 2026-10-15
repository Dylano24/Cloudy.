import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { componentHarness, elements, textContent } from './helpers/component-harness.mjs';

function setup() {
  const harness = componentHarness();
  const { default: Preview } = loadTypeScript('components/shop/rust-kit-preview.tsx', {
    imports: { react: harness.react, 'next/link': 'a' },
  });
  harness.mount(Preview);
  return harness;
}
const buttons = tree => elements(tree, node => node.type === 'button');

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
  search.props.onChange({ target: { value: 'cloth' } });
  let tree = h.render();
  assert.ok(elements(tree, node => node.props.kit).length > 0);
  buttons(tree).find(node => textContent(node) === 'Resources').props.onClick();
  tree = h.render();
  assert.ok(textContent(tree).includes('No kits found'));
  buttons(tree).find(node => textContent(node).includes('Reset filters')).props.onClick();
  tree = h.render();
  assert.equal(elements(tree, node => node.props.kit).length, 6);
});
