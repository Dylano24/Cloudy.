import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const require = createRequire(import.meta.url);
const React = require('react');
const middleware = require('zustand/middleware');
const field = { id: 7, marker: 'bonus', order: 0, name: 'Bonus', type: 'checkbox', required: false, price: 5 };
const product = { id: 1, name: 'Fixture product', status: true, slug: 'fixture', price: 10, category: null, subscription: false, featured: false, created_date: 0, quantity: true, files: false, giftcard: false, enable_stock: true, stock: 3, custom_fields: [field] };

function cartFixture() {
  const storage = new Map();
  const fixtureStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => { storage.set(key, value); },
    removeItem: key => { storage.delete(key); },
  };
  return loadTypeScript('hooks/use-cart.ts', {
    imports: { 'zustand/middleware': { ...middleware, persist: (create, options) => middleware.persist(create, { ...options, storage: middleware.createJSONStorage(() => fixtureStorage) }) } },
  }).useCart;
}

test('marker-keyed checkbox selections are charged in the basket total', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 1, { bonus: true });
  assert.equal(cart.getState().getTotal(), 15);
});

test('basket totals retain numeric IDs and marker-keyed option and number charges', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 1, { '7': true });
  cart.getState().addItem({ ...product, id: 2, custom_fields: [{ ...field, type: 'number', marker: 'points', price: 2, default_value: 5 }] }, 1, { points: 11 });
  cart.getState().addItem({ ...product, id: 3, custom_fields: [{ ...field, type: 'select', marker: 'choice', options: [{ id: 9, order: 0, name: 'Extra', value: 'extra', price: 3 }] }] }, 1, { choice: 9 });
  assert.equal(cart.getState().getTotal(), 50); // $15 + $22 + $13
});

test('marker-keyed numeric fields enforce rules that refer to numeric field IDs', () => {
  const { calculateRuleTotal, validateCustomRules } = loadTypeScript('lib/custom-rules-utils.ts');
  const rule = { id: 1, order: 0, name: 'Points limit', type: 'sum', max: 10, fields: [7] };
  const fields = [{ ...field, type: 'number', marker: 'points' }];
  assert.equal(calculateRuleTotal(rule, { points: 11 }, fields), 11);
  assert.equal(validateCustomRules([rule], { points: 11 }, fields)[0].isValid, false);
  assert.equal(calculateRuleTotal(rule, { '7': 4 }, fields), 4);
});

test('API conversion prefers current marker values over a stale numeric value', () => {
  const { convertCustomFieldsForApi } = loadTypeScript('lib/cart-utils.ts');
  assert.deepEqual(convertCustomFieldsForApi({ bonus: false, '7': true }, [field]), { '7': false });
  assert.deepEqual(convertCustomFieldsForApi({ bonus: 0 }, [field]), { '7': 0 });
});

test('basket selections display saved numeric IDs even when the field has a marker', () => {
  const { formatCustomFieldsForDisplay } = loadTypeScript('lib/cart-utils.ts');
  assert.equal(formatCustomFieldsForDisplay({ '7': true }, [field]), 'Bonus');
});

test('explicit false and zero marker values override saved numeric values', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 1, { bonus: false, '7': true });
  assert.equal(cart.getState().getTotal(), 10);
  const { calculateRuleTotal } = loadTypeScript('lib/custom-rules-utils.ts');
  const rule = { id: 1, order: 0, name: 'Points', type: 'sum', fields: [7] };
  assert.equal(calculateRuleTotal(rule, { points: 0, '7': 11 }, [{ ...field, marker: 'points', type: 'number' }]), 0);
});

test('quantity updates reserve stock already used by other configurations', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 1, { bonus: true });
  cart.getState().addItem(product, 1, { bonus: false });
  cart.getState().updateQuantity(1, 3, { bonus: true });
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [2, 1]);
  cart.getState().updateQuantity(1, 1, { bonus: true });
  cart.getState().addItem(product, 3, { bonus: false });
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [1, 2]);
});

test('stock caps include additions of new variants and exclude other products', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 2, { bonus: true });
  cart.getState().addItem(product, 2, { bonus: false });
  cart.getState().addItem(product, 1, { bonus: 'third' });
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [2, 1]);
  cart.getState().addItem({ ...product, id: 2 }, 3);
  cart.getState().updateQuantity(2, 9);
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [2, 1, 3]);
});

test('unlimited stock and reducing a variant quantity retain their behavior', () => {
  const cart = cartFixture();
  cart.getState().addItem({ ...product, stock: undefined }, 1, { bonus: true });
  cart.getState().addItem({ ...product, stock: undefined }, 1, { bonus: false });
  cart.getState().updateQuantity(1, 25, { bonus: true });
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [25, 1]);
  cart.getState().updateQuantity(1, 0, { bonus: true });
  assert.deepEqual(cart.getState().items.map(item => item.quantity), [1]);
});

function findElement(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = findElement(child, predicate);
    if (result) return result;
  }
}

function findElements(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  return [
    ...(predicate(node) ? [node] : []),
    ...[node.props?.children].flat(Infinity).flatMap(child => findElements(child, predicate)),
  ];
}

test('the basket sends ID-keyed custom fields when starting hosted checkout', async () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 1, { bonus: true });
  let submitted;
  let stateCall = 0;
  const { default: CartPage } = loadTypeScript('app/cart/page.tsx', {
    imports: {
      react: { ...React, useEffect: () => {}, useState: value => [stateCall++ === 1 ? true : value, () => {}] },
      '@/hooks/use-cart': { useCart: () => cart.getState() },
      '@/hooks/use-api': { useStore: () => ({ data: { id: 42 } }) },
      'next/navigation': { useRouter: () => ({ push: () => { throw new Error('Unexpected local checkout'); } }) },
      '@/lib/tip4serv': { openTip4ServCheckout: async options => { submitted = options; } },
    },
    globals: { window: { location: { origin: 'https://fixture.example' } } },
  });
  const button = findElement(CartPage(), node => node.type === 'button' && node.props.className?.includes('w-full px-8'));
  assert.ok(button);
  await button.props.onClick();
  assert.deepEqual(submitted.products, [{ product: 1, quantity: 1, customFields: { '7': true } }]);
  assert.equal(submitted.successUrl, 'https://fixture.example/checkout/success');
});

test('the basket disables increasing either variant once aggregate stock is exhausted', () => {
  const cart = cartFixture();
  cart.getState().addItem(product, 2, { bonus: true });
  cart.getState().addItem(product, 1, { bonus: false });
  const Plus = require('lucide-react').Plus;
  const { default: CartPage } = loadTypeScript('app/cart/page.tsx', {
    imports: {
      react: { ...React, useEffect: () => {}, useState: value => [value, () => {}] },
      '@/hooks/use-cart': { useCart: () => cart.getState() },
      '@/hooks/use-api': { useStore: () => ({ data: { id: 42 } }) },
      'next/navigation': { useRouter: () => ({}) },
    },
  });
  const buttons = findElements(CartPage(), node => node.type === 'button' && findElement(node.props.children, child => child.type === Plus));
  assert.equal(buttons.length, 2);
  assert.deepEqual(buttons.map(button => button.props.disabled), [true, true]);
});

function oauthFixture() {
  const fixture = {
    imports: {
      '@/lib/account-session': { STATE_COOKIE: 'cloudy-login-state', accountSigningSecret: () => 'fixture-only-signing-key' },
      '@/lib/account-oauth-finish': { finishAccountOAuth: () => { throw new Error('Unexpected account persistence in fixture'); } },
    },
    globals: { console: { error: () => {} } },
  };
  return {
    ...loadTypeScript('lib/discord-oauth-state.ts', fixture),
    ...loadTypeScript('app/api/oauth/discord/callback/route.ts', fixture),
  };
}

function oauthRequest(state, cookie) {
  const nextUrl = new URL('https://fixture.example/api/oauth/discord/callback');
  nextUrl.searchParams.set('state', state);
  nextUrl.searchParams.set('code', 'fixture-code');
  return { nextUrl, cookies: { get: name => name === 'cloudy-login-state' && cookie ? { value: cookie } : undefined } };
}

test('generated signed login and create states enter the account callback', async () => {
  const oauth = oauthFixture();
  for (const intent of ['login', 'create']) {
    const state = oauth.createDiscordOAuthState(intent);
    assert.equal(oauth.verifyDiscordOAuthState(state), intent);
    const response = await oauth.GET(oauthRequest(state));
    assert.equal(response.headers.get('location'), 'https://fixture.example/account?login_error=unavailable');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(response.headers.get('set-cookie'), /cloudy-login-state=;.*Max-Age=0/);
  }
});

test('altered signed account states still fail validation before any network call', async () => {
  const oauth = oauthFixture();
  const state = oauth.createDiscordOAuthState('login');
  const altered = state.slice(0, -1) + (state.endsWith('A') ? 'B' : 'A');
  const response = await oauth.GET(oauthRequest(altered));
  assert.equal(response.headers.get('location'), 'https://fixture.example/account?login_error=failed');
});

test('legacy cookie-validated account state continues to enter the account callback', async () => {
  const oauth = oauthFixture();
  const state = 'cloudy-login:create:fixture-legacy-nonce';
  const response = await oauth.GET(oauthRequest(state, state));
  assert.equal(response.headers.get('location'), 'https://fixture.example/account?login_error=unavailable');
});

test('legacy checkout state retains the checkout callback error destination', async () => {
  const oauth = oauthFixture();
  const request = oauthRequest('https://fixture.example|/checkout');
  request.nextUrl.searchParams.delete('code');
  const response = await oauth.GET(request);
  assert.equal(response.headers.get('location'), 'https://fixture.example/checkout?discord_error=no_code');
});
