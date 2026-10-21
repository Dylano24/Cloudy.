import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { componentHarness, elements } from './helpers/component-harness.mjs';

function fixture(phone = true, session = null) {
  const harness = componentHarness();
  const refs = [];
  const listeners = new Map();
  const media = { matches: phone, addEventListener: (_, fn) => listeners.set('change', fn), removeEventListener: () => {} };
  const header = { inert: false }, main = { inert: false }, footer = { inert: true };
  const dock = { parentElement: { children: [header, main, footer] } };
  dock.parentElement.children.push(dock);
  const body = { style: { position: '', top: '', left: '', right: '', width: '' } };
  const scrolls = [], focus = [];
  const react = { ...harness.react, memo: fn => fn, useLayoutEffect: harness.react.useEffect,
    useRef(value) { const ref = harness.react.useRef(value); if (!refs.includes(ref)) refs.push(ref); return ref; } };
  const { CloudyHelp } = loadTypeScript('components/help/cloudy-help.tsx', {
    imports: { react, '@/components/help/cloudy-knowledge': { helpEntries: [] },
      './cloudy-knowledge': { helpEntries: [] }, '@/lib/cloudy-chat-context': { assistantKnowledge() {} },
      './cloudy-message': { CloudyMessage: () => null },
      '@/lib/assistant-session': { readAssistantSession: () => session, saveAssistantSession() {}, clearAssistantSession() {} } },
    globals: { window: { matchMedia: () => media, scrollY: 650, scrollTo: (...args) => scrolls.push(args) },
      document: { body, addEventListener() {}, removeEventListener() {} } },
  });
  harness.mount(CloudyHelp);
  refs[0].current = { focus: options => focus.push(options) };
  refs[2].current = { focus() {}, blur() {} };
  refs[3].current = { scrollHeight: 20 };
  refs[4].current = dock;
  const click = label => { elements(harness.tree, node => node.type === 'button' && node.props['aria-label'] === label)[0].props.onClick(); harness.render(); };
  return { harness, click, header, main, footer, body, scrolls, focus,
    rotate(matches) { media.matches = matches; listeners.get('change')?.(); } };
}

test('mobile chat prevents background Home and other page controls receiving input', () => {
  const f = fixture();
  f.click('Assistant');
  assert.equal(f.header.inert, true);
  assert.equal(f.main.inert, true);
  assert.equal(f.body.style.top, '-650px');
  f.click('Close Cloudy assistant');
  assert.equal(f.header.inert, false);
  assert.equal(f.main.inert, false);
  assert.equal(f.footer.inert, true, 'previous inert state must be preserved');
});

test('closing mobile chat restores the original position immediately without a focus jump', () => {
  const f = fixture();
  f.click('Assistant');
  f.click('Close Cloudy assistant');
  assert.deepEqual(f.scrolls, [[{ top: 650, left: 0, behavior: 'instant' }]]);
  assert.deepEqual(f.focus, [{ preventScroll: true }]);
  assert.equal(f.body.style.position, '');
});

test('desktop retains background navigation and rotation releases only the mobile lock', () => {
  const desktop = fixture(false);
  desktop.click('Assistant');
  assert.equal(desktop.header.inert, false);
  assert.equal(desktop.body.style.position, '');
  assert.deepEqual(desktop.scrolls, []);
  const mobile = fixture();
  mobile.click('Assistant');
  mobile.rotate(false);
  assert.equal(mobile.header.inert, false);
  assert.equal(mobile.body.style.position, '');
  mobile.rotate(true);
  assert.equal(mobile.header.inert, true);
  assert.ok(elements(mobile.harness.tree, node => node.props.role === 'dialog').length);
});

test('a restored phone session stays open through typing and ordinary rerenders until explicitly closed', () => {
  const f = fixture(true, { open: true, question: 'Saved draft', messages: [], activePhoneTopicId: null });
  const launcher = () => elements(f.harness.tree, node => node.type === 'button' && node.props['aria-label'] === 'Assistant')[0];
  const input = () => elements(f.harness.tree, node => node.type === 'input')[0];
  assert.equal(launcher().props['aria-expanded'], true);
  assert.equal(input().props.value, 'Saved draft');
  input().props.onChange({ target: { value: 'Still typing' } });
  f.harness.render();
  for (let i = 0; i < 25; i++) f.harness.render();
  assert.equal(launcher().props['aria-expanded'], true);
  assert.equal(input().props.value, 'Still typing');
  f.click('Close Cloudy assistant');
  assert.equal(launcher().props['aria-expanded'], false);
});
