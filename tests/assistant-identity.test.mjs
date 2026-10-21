import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const { assistantIdentityReply } = loadTypeScript('lib/assistant-identity.ts');
test('direct identity questions use Cloudy and Dylano without inventing a model version', () => {
  for (const question of ['Wie ben jij?', 'Wie heeft jou gemaakt?', 'Who created you?', 'Are you ChatGPT 4?', 'What model are you?', 'Welk model gebruik jij?']) {
    const reply = assistantIdentityReply(question);
    assert.ok(reply, question);
    assert.match(reply, /Cloudy assistant/i);
    assert.match(reply, /Dylano/);
    assert.doesNotMatch(reply, /ChatGPT|GPT.?4|Astra|Asra/i);
  }
});
test('ordinary questions still reach the existing AI', () => {
  for (const question of ['How does GPT-4 work?', 'Who created Rust?', 'Write a poem', 'What are Cloudy products?']) assert.equal(assistantIdentityReply(question), null);
});

test('creator attribution includes Dylano as owner and lead developer, including informal wording', () => {
  for (const question of ['Who made u?', 'Who created Cloudy Assistant?', 'Who built the Cloudy Assistant?', 'Wie heeft je gemaakt?']) {
    const reply = assistantIdentityReply(question);
    assert.match(reply, /Dylano/);
    assert.match(reply, /owner/);
    assert.match(reply, /lead developer/);
    assert.doesNotMatch(reply, /Doriane|sole owner|co-owner/);
  }
});

test('the approved introduction includes the website, bot and technical systems', () => {
  assert.equal(assistantIdentityReply('Who created u?'), 'I’m Cloudy Assistant, created and set up by Dylano, owner and lead developer of Cloudy Inc. He also created the Cloudy website, Cloudy bot, and Cloudy’s technical systems.');
  const dutch = assistantIdentityReply('Wie heeft jou gemaakt?');
  assert.match(dutch, /Cloudy-website, Cloudy bot en de technische systemen/);
});
