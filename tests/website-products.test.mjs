import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { componentHarness, elements, fixtureCart, textContent } from './helpers/component-harness.mjs';

const product = {
  id: 1, name: 'Fixture product', slug: 'fixture-product', status: true,
  price: 10, category: null, subscription: false, featured: false, created_date: 0,
  quantity: true, files: false, giftcard: false, enable_stock: false, stock: 100,
  custom_fields: [], custom_rules: [],
};
const numberField = { id: 7, order: 1, name: 'Coins', marker: 'coins', type: 'number', number_type: 'range', required: true, default_value: 2, minimum: 1, maximum: 10, step: 1, price: 0 };

test('the product hook keeps detail queries disabled on demand and preserves automatic page loading', async () => {
  const requests = [];
  const { useProduct } = loadTypeScript('hooks/use-api.ts', {
    imports: { '@tanstack/react-query': { useQuery: options => options } },
    globals: { fetch: async url => { requests.push(url); return { ok: true, json: async () => product }; } },
  });
  const deferred = useProduct('fixture/product', true, false);
  assert.equal(deferred.enabled, false);
  assert.equal(useProduct('fixture-product').enabled, true);
  assert.equal(useProduct('').enabled, false);
  assert.deepEqual(deferred.queryKey, ['store', 'product', 'slug', 'fixture/product', true]);
  assert.deepEqual(requests, []);
  await deferred.queryFn();
  assert.deepEqual(requests, ['/api/tip4serv/store/product/slug/fixture%2Fproduct?details=true']);
});

const storage = () => {
  const saved = new Map();
  return { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
};
function imports(harness, cart, api, router = { push() {}, replace() {} }) {
  return {
    react: harness.react,
    'next/link': 'a',
    'next/image': 'image',
    'next/navigation': { useRouter: () => router, useSearchParams: () => new URLSearchParams() },
    'framer-motion': { motion: { div: 'motion.div', button: 'motion.button' }, AnimatePresence: 'presence' },
    '@/hooks/use-cart': { useCart: cart.useCart },
    '@/hooks/use-api': api,
  };
}
function button(tree, label) {
  const found = elements(tree, node => typeof node.props.onClick === 'function' &&
    (node.props['aria-label'] === label || textContent(node).trim() === label))[0];
  assert.ok(found, 'Missing button: ' + label);
  return found;
}
function cardFixture(fetchDetails) {
  const harness = componentHarness();
  const cart = fixtureCart();
  let requests = 0;
  let automatic = false;
  let result = { data: undefined, error: null };
  const api = {
    useProduct(slug, details = true, enabled = true) {
      assert.equal(slug, 'fixture-product');
      assert.equal(details, true);
      const refetch = async () => {
        requests++;
        try { result = { data: await fetchDetails(), error: null }; }
        catch (error) { result = { data: undefined, error }; }
        return result;
      };
      if (enabled && !automatic) { automatic = true; void refetch(); }
      return { ...result, refetch };
    },
  };
  const { ProductCard } = loadTypeScript('components/product/product-card.tsx', {
    imports: imports(harness, cart, api),
    globals: { setTimeout: () => 0 },
  });
  harness.mount(ProductCard, { product });
  return { harness, cart, get requests() { return requests; } };
}

test('mounting a product card does not request checkout details until Add', async () => {
  const fixture = cardFixture(async () => product);
  assert.equal(fixture.requests, 0);
  await button(fixture.harness.tree, 'Add to cart').props.onClick({ preventDefault() {} });
  assert.equal(fixture.requests, 1);
  assert.equal(fixture.cart.state.items.length, 1);
});

test('Add waits for details and opens required customization without adding an incomplete item', async () => {
  let resolve;
  const fixture = cardFixture(() => new Promise(done => { resolve = done; }));
  const pending = button(fixture.harness.tree, 'Add to cart').props.onClick({ preventDefault() {} });
  fixture.harness.render();
  assert.equal(fixture.cart.state.items.length, 0);
  assert.equal(button(fixture.harness.tree, 'Add to cart').props.disabled, true);
  resolve({ ...product, custom_fields: [numberField] });
  await pending;
  fixture.harness.render();
  assert.equal(fixture.cart.state.items.length, 0);
  assert.ok(elements(fixture.harness.tree, node => node.props.isOpen === true).length);
});

test('failed product details keep Add retryable without creating a cart item', async () => {
  const fixture = cardFixture(async () => { throw new Error('Fixture network failure'); });
  await button(fixture.harness.tree, 'Add to cart').props.onClick({ preventDefault() {} });
  fixture.harness.render();
  assert.equal(fixture.cart.state.items.length, 0);
  const add = elements(fixture.harness.tree, node => node.type === 'motion.button')[0];
  assert.equal(add.props.disabled, false);
  assert.match(add.props.title, /try again/i);
});

function storeFixture(initialQuery) {
  const harness = componentHarness();
  const cart = fixtureCart();
  let query = initialQuery;
  const observers = [];
  const requestedPages = [];
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() { this.active = true; }
    unobserve() { this.active = false; }
    disconnect() { this.active = false; }
  }
  const api = {
    useStore: () => ({ data: { id: 1 } }),
    useCategories: () => ({ data: { categories: [{ id: 99, name: 'Another category', parent_id: 0, hide: false }] } }),
    useProducts: params => { requestedPages.push(params); return { ...query, refetch() {} }; },
  };
  const loaded = loadTypeScript('components/shop/rust-store.tsx', {
    imports: { ...imports(harness, cart, api), '@/components/product/product-card': { ProductCard: 'product-card' } },
    globals: { IntersectionObserver: Observer },
  });
  harness.mount(loaded.default);
  return { harness, observers, requestedPages, setQuery(next) { query = next; } };
}
const query = rows => ({ data: { products: rows, product_count: rows.length }, isLoading: false, isFetching: false, isPlaceholderData: false });
const cards = tree => elements(tree, node => node.type === 'product-card');

test('switching category never appends products retained as placeholder data', () => {
  const fixture = storeFixture(query([product]));
  fixture.setQuery({ ...query([product]), isFetching: true, isPlaceholderData: true });
  button(fixture.harness.tree, 'Another category').props.onClick();
  fixture.harness.render();
  assert.equal(cards(fixture.harness.tree).length, 0);
});

test('refreshing unchanged product IDs updates their stock and price', () => {
  const fixture = storeFixture(query([product]));
  fixture.setQuery(query([{ ...product, stock: 0, price: 12 }]));
  fixture.harness.render();
  assert.equal(cards(fixture.harness.tree)[0].props.product.stock, 0);
  assert.equal(cards(fixture.harness.tree)[0].props.product.price, 12);
});

test('pagination stops observing while the next page is fetching', () => {
  const rows = Array.from({ length: 50 }, (_, id) => ({ ...product, id: id + 1 }));
  const fixture = storeFixture(query(rows));
  fixture.observers.findLast(observer => observer.active).callback([{ isIntersecting: true }]);
  fixture.setQuery({ ...query(rows), isFetching: true, isPlaceholderData: true });
  fixture.harness.render();
  assert.equal(fixture.requestedPages.at(-1).page, 2);
  assert.equal(fixture.observers.filter(observer => observer.active).length, 0);
});

test('repeated intersection callbacks request only one next page before it arrives', () => {
  const rows = Array.from({ length: 50 }, (_, id) => ({ ...product, id: id + 1 }));
  const fixture = storeFixture(query(rows));
  const observer = fixture.observers.findLast(entry => entry.active);
  observer.callback([{ isIntersecting: true }]);
  observer.callback([{ isIntersecting: true }]);
  fixture.setQuery({ ...query(rows), isFetching: true, isPlaceholderData: true });
  fixture.harness.render();
  assert.equal(fixture.requestedPages.at(-1).page, 2);
});

test('reopening the customization modal restores required numeric defaults after Add', () => {
  const harness = componentHarness();
  const cart = fixtureCart();
  const configured = { ...product, custom_fields: [numberField] };
  const { CustomFieldsModal } = loadTypeScript('components/product/custom-fields-modal.tsx', {
    imports: imports(harness, cart, {}),
    globals: { setTimeout: () => 0 },
  });
  const props = { product: configured, isOpen: true, onClose() {} };
  harness.mount(CustomFieldsModal, props);
  button(harness.tree, 'Add to Cart - $10.00').props.onClick();
  harness.update({ ...props, isOpen: false });
  harness.update(props);
  button(harness.tree, 'Add to Cart - $10.00').props.onClick();
  assert.equal(cart.state.items.length, 2);
  assert.deepEqual(cart.state.items.map(item => item.customFields), [{ coins: 2 }, { coins: 2 }]);
});

function donationFixture() {
  const harness = componentHarness();
  const cart = fixtureCart();
  const destinations = [];
  const loaded = loadTypeScript('app/product/[slug]/page.tsx', {
    imports: imports(harness, cart, { useProduct: () => ({ data: { ...product, donation: true, min_donation: 5 }, isLoading: false }) }, { push: path => destinations.push(path), replace() {} }),
    globals: { setTimeout: () => 0 },
  });
  harness.mount(loaded.default, { params: { slug: product.slug } });
  return { harness, cart, destinations };
}

test('Buy Now preserves the selected donation amount', () => {
  const fixture = donationFixture();
  elements(fixture.harness.tree, node => node.type === 'input' && node.props.step === '0.01')[0].props.onChange({ target: { value: '42' } });
  fixture.harness.render();
  button(fixture.harness.tree, 'Buy Now').props.onClick();
  assert.equal(fixture.cart.state.items[0].donationAmount, 42);
  assert.deepEqual(fixture.destinations, ['/cart']);
});

test('Buy Now rejects donations below the product minimum', () => {
  const fixture = donationFixture();
  elements(fixture.harness.tree, node => node.type === 'input' && node.props.step === '0.01')[0].props.onChange({ target: { value: '2' } });
  fixture.harness.render();
  button(fixture.harness.tree, 'Buy Now').props.onClick();
  assert.equal(fixture.cart.state.items.length, 0);
  assert.deepEqual(fixture.destinations, []);
});

for (const identifiers of [['minecraft_uuid'], ['minecraft_uid'], ['minecraft_uuid', 'minecraft_uid', 'minecraft_username']]) {
  test('checkout renders one usable Minecraft username input for ' + identifiers.join(', '), async () => {
    const harness = componentHarness();
    const cart = fixtureCart();
    cart.state.addItem(product);
    const payloads = [];
    const api = {
      useStore: () => ({ data: { id: 1 } }),
      useCheckoutIdentifiers: () => ({ data: { identifiers }, isLoading: false }),
      useCheckout: () => ({ isError: false, mutateAsync: async payload => { payloads.push(payload); return { url: 'https://example.test/checkout' }; } }),
    };
    const loaded = loadTypeScript('app/checkout/page.tsx', {
      imports: imports(harness, cart, api),
      globals: {
        localStorage: storage(),
        fetch: async url => {
          if (url === '/api/config') return { ok: true, json: async () => ({ handleCustomerIdentification: true }) };
          if (url === '/api/account') return { ok: true, json: async () => ({user:{id:'fixture-account',provider:'google',name:'FixturePlayer'}}) };
          assert.equal(url, '/api/minecraft/uuid?username=FixturePlayer');
          return { ok: true, json: async () => ({ uuid: '0123456789abcdef0123456789abcdef' }) };
        },
        window: { open: () => null, location: { origin: 'https://example.test' } },
        console: { log() {}, error() {} },
      },
    });
    const content = elements(loaded.default(), node => typeof node.type === 'function')[0].type;
    harness.mount(content);
    await harness.flush();
    assert.equal(elements(harness.tree, node => node.type === 'input' && node.props.id === 'minecraft_username').length, 1);
    assert.equal(elements(harness.tree, node => node.type === 'input' && ['minecraft_uid', 'minecraft_uuid'].includes(node.props.id)).length, 0);
    elements(harness.tree, node => node.type === 'input' && node.props.id === 'email')[0].props.onChange({ target: { value: 'fixture@example.test' } });
    harness.render();
    await elements(harness.tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    harness.render();
    assert.equal(payloads.length, 0);
    assert.match(textContent(harness.tree), /Minecraft Username is required/);
    elements(harness.tree, node => node.type === 'input' && node.props.id === 'minecraft_username')[0].props.onChange({ target: { value: 'FixturePlayer' } });
    harness.render();
    await elements(harness.tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    assert.equal(payloads.length, 1);
    assert.equal(payloads[0].user.minecraft_username, 'FixturePlayer');
    assert.equal(payloads[0].user.minecraft_uuid, '0123456789abcdef0123456789abcdef');
  });
}
