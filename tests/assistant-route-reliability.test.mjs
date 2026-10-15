import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as context from '../lib/cloudy-chat-context.ts';
import { assistantIdentityReply } from '../lib/assistant-identity.ts';
import { findHelp } from '../components/help/cloudy-knowledge.ts';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const ts = require('typescript');
const routeSource = readFileSync(new URL('../app/api/assistant/chat/route.ts', import.meta.url), 'utf8');

function routeFixture() {
  const compiledModule = { exports: {} };
  const deadline = new AbortController();
  let timeoutDelay;
  let upstreamSignal;
  let finish;
  let notifyStarted;
  const started = new Promise(resolve => { notifyStarted = resolve; });
  const javascript = ts.transpileModule(routeSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(javascript, {
    module: compiledModule,
    exports: compiledModule.exports,
    Buffer,
    AbortSignal: {
      timeout: delay => { timeoutDelay = delay; return deadline.signal; },
      any: signals => AbortSignal.any(signals),
    },
    process: { env: { CLOUDY_ASSISTANT_SHARED_SECRET: 'assistant-test-fixture-secret-only' } },
    fetch: (_url, options) => {
      upstreamSignal = options.signal;
      notifyStarted();
      return new Promise((resolve, reject) => {
        finish = () => resolve(new Response(JSON.stringify({ answer: 'An answer.' }), {
          headers: { 'Content-Type': 'application/json' },
        }));
        if (options.signal.aborted) reject(options.signal.reason);
        else options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
      });
    },
    require: name => {
      if (name === '@/components/help/cloudy-knowledge') return { findHelp };
      if (name === '@/lib/cloudy-chat-context') return context;
      if (name === '@/lib/assistant-identity') return { assistantIdentityReply };
      return require(name);
    },
  });
  return {
    POST: compiledModule.exports.POST,
    started,
    deadline,
    finish: () => finish(),
    get upstreamSignal() { return upstreamSignal; },
    get timeoutDelay() { return timeoutDelay; },
  };
}

function request(signal, question = 'Tell me a short story') {
  return new NextRequest('https://cloudy.test/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-vercel-forwarded-for': 'test-client' },
    body: JSON.stringify({ question, history: [] }),
    signal,
  });
}

test('identity answers cannot be replaced by an invented upstream model claim', async () => {
  const fixture = routeFixture();
  const response = await fixture.POST(request(new AbortController().signal, 'Are you ChatGPT 4?'));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.match(data.answer, /Cloudy assistant/);
  assert.match(data.answer, /Dylano/);
  assert.doesNotMatch(data.answer, /ChatGPT|GPT.?4/);
  assert.equal(fixture.upstreamSignal, undefined);
});

test('an incoming disconnect cancels the existing upstream request', async () => {
  const fixture = routeFixture();
  const incoming = new AbortController();
  const pending = fixture.POST(request(incoming.signal));
  await fixture.started;
  try {
    incoming.abort();
    assert.equal(fixture.upstreamSignal.aborted, true, 'Railway work must stop after the visitor disconnects');
  } finally {
    fixture.finish();
    await pending;
  }
});

test('upstream work still cancels at the existing deadline', async () => {
  const fixture = routeFixture();
  const pending = fixture.POST(request(new AbortController().signal));
  await fixture.started;
  assert.equal(fixture.timeoutDelay, 50000);
  fixture.deadline.abort(new DOMException('Timed out', 'TimeoutError'));
  assert.equal(fixture.upstreamSignal.aborted, true);
  const response = await pending;
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
