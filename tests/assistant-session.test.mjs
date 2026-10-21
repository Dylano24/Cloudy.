import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const { readAssistantSession, saveAssistantSession, clearAssistantSession } = loadTypeScript('lib/assistant-session.ts');
function storage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const chat = { question: 'My next question', activePhoneTopicId: null, messages: [
  { role: 'visitor', text: 'How can I get support?' },
  { role: 'assistant', response: { answer: 'Visit support.', links: [{ label: 'Support', href: '/support' }] } },
] };

test('an open chat and draft survive a page reload in the same tab', () => {
  const s = storage();
  saveAssistantSession(s, chat);
  assert.deepEqual(readAssistantSession(s), chat);
});
test('an explicit close clears the chat so reload never reopens it', () => {
  const s = storage();
  saveAssistantSession(s, chat);
  clearAssistantSession(s);
  assert.equal(readAssistantSession(s), null);
});
test('resetting a conversation keeps an open empty chat recoverable', () => {
  const s = storage();
  const empty = { question: '', activePhoneTopicId: null, messages: [] };
  saveAssistantSession(s, empty);
  assert.deepEqual(readAssistantSession(s), empty);
});
test('blocked storage cannot break the live assistant', () => {
  const s = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.equal(readAssistantSession(s), null);
  assert.doesNotThrow(() => saveAssistantSession(s, chat));
  assert.doesNotThrow(() => clearAssistantSession(s));
});
test('corrupted or unsafe saved content is ignored', () => {
  const s = storage();
  saveAssistantSession(s, chat);
  const [key, value] = [...s.values][0];
  s.setItem(key, value.replace('/support', 'javascript:alert(1)'));
  assert.equal(readAssistantSession(s), null);
  s.setItem(key, '{');
  assert.equal(readAssistantSession(s), null);
});

test('open state survives navigation and explicit close remains closed without losing history', () => {
  const s = storage();
  saveAssistantSession(s, { ...chat, open: true });
  assert.equal(readAssistantSession(s).open, true);
  saveAssistantSession(s, { ...chat, open: false });
  assert.equal(readAssistantSession(s).open, false);
  assert.deepEqual(readAssistantSession(s).messages, chat.messages);
});
