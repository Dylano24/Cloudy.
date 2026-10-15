import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as context from '../lib/cloudy-chat-context.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const path = new URL('../lib/assistant-request.ts', import.meta.url);
let buildAssistantRequest;
if (existsSync(path)) {
  const compiledModule = { exports: {} };
  const javascript = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(javascript, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: name => {
      if (name === './cloudy-chat-context') return context;
      throw new Error(`Unexpected helper dependency: ${name}`);
    },
  });
  buildAssistantRequest = compiledModule.exports.buildAssistantRequest;
}

function build(question, history) {
  assert.equal(typeof buildAssistantRequest, 'function', 'the request builder must enforce the API body limit');
  return buildAssistantRequest(question, history);
}

test('allowed long answers remain usable as subsequent request history', () => {
  const history = Array.from({ length: 3 }, () => [
    { role: 'user', content: 'Tell me a detailed story' },
    { role: 'assistant', content: 'a'.repeat(3500) },
  ]).flat();
  const body = build('What next?', history);
  const decoded = JSON.parse(body);
  assert.ok(body.length <= 8000);
  assert.equal(decoded.question, 'What next?');
  assert.equal(decoded.history.length, 6);
  assert.equal(decoded.history[1].content.length, 550);
  assert.equal(history[1].content.length, 3500, 'displayed answers remain intact');
});

test('recent history retains the existing eight-turn and 550-character policy', () => {
  const history = Array.from({ length: 10 }, (_, i) => ({
    role: i % 2 ? 'assistant' : 'user',
    content: `  turn ${i} ${'x'.repeat(600)}  `,
  }));
  const decoded = JSON.parse(build('Next question', history));
  assert.equal(decoded.history.length, 8);
  assert.ok(decoded.history[0].content.startsWith('turn 2 '));
  assert.ok(decoded.history[7].content.startsWith('turn 9 '));
  assert.ok(decoded.history.every(turn => turn.content.length === 550));
});

test('JSON escaping drops oldest turns until the serialized request fits', () => {
  const question = '"'.repeat(1000);
  const history = Array.from({ length: 8 }, (_, i) => ({
    role: i % 2 ? 'assistant' : 'user',
    content: `turn ${i} ${'"'.repeat(600)}`,
  }));
  const body = build(question, history);
  const decoded = JSON.parse(body);
  assert.ok(body.length <= 8000);
  assert.equal(decoded.question, question);
  assert.equal(decoded.history.length, 5);
  assert.ok(decoded.history[0].content.startsWith('turn 3 '));
  assert.ok(decoded.history[4].content.startsWith('turn 7 '));
  assert.equal(history.length, 8);
});

test('worst-case escaped questions keep their text even when all history must be dropped', () => {
  const question = '\u0000'.repeat(1000);
  const body = build(question, [{ role: 'user', content: '\u0000'.repeat(550) }]);
  assert.ok(body.length <= 8000);
  assert.deepEqual(JSON.parse(body), { question, history: [] });
});
