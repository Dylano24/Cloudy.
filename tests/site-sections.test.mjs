import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Web Solutions and VPN are temporarily disabled with one reversible switch', () => {
  const flags = load('lib/site-sections.ts');
  assert.match(flags, /webSolutions:\s*false/);
  assert.match(flags, /vpn:\s*false/);
});

test('navigation and homepage do not expose disabled pages', () => {
  const header = load('components/layout/header.tsx');
  const home = load('app/page.tsx');
  assert.match(header, /siteSections\.webSolutions\s*\?/);
  assert.match(header, /siteSections\.vpn\s*\?/);
  assert.match(home, /siteSections\.webSolutions\s*&&/);
});

test('both routes return not-found while keeping original page implementations for restoration', () => {
  for (const [route, flag, original] of [
    ['service', 'webSolutions', 'Cloudy Studio'],
    ['vpn', 'vpn', 'Cloudy VPN'],
  ]) {
    const page = load('app/' + route + '/page.tsx');
    const archived = load('app/' + route + '/archived-page.tsx');
    assert.ok(page.includes('!siteSections.' + flag));
    assert.match(page, /notFound\(\)/);
    assert.match(page, /from '\.\/archived-page'/);
    assert.ok(archived.includes(original), 'Original ' + route + ' content missing');
  }
});
