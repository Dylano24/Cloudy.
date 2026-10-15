import assert from 'node:assert/strict';
import test from 'node:test';
import { assistantKnowledge } from '../lib/cloudy-chat-context.ts';
import { findHelp } from '../components/help/cloudy-knowledge.ts';

const policyHistory = [
  { role: 'user', content: 'Where can I find the refund terms?' },
  { role: 'assistant', content: 'You can read the refund policy in the terms of sale.' },
];

test('switching to an unrelated question removes earlier policy evidence and navigation', () => {
  for (const question of [
    'Tell me a joke about dinosaurs',
    'How do I write a Python loop?',
    'Can you explain quantum physics?',
    'Kun je een verhaal schrijven?',
    'Peux-tu expliquer la physique?',
  ]) {
    const context = assistantKnowledge(question, policyHistory, findHelp);
    assert.deepEqual(JSON.parse(context.evidence).verifiedWebsiteInformation, [], question);
    assert.deepEqual(context.links, [], question);
    assert.equal(context.source, undefined, question);
  }
});

test('clear follow-ups keep the earlier issue in English, Dutch and French', () => {
  const history = [
    { role: 'user', content: 'I paid but my kit was not received' },
    { role: 'assistant', content: 'Check your payment and contact support.' },
  ];
  for (const question of [
    'And what should I do next?',
    'En wat moet ik nu doen?',
    'Et que dois-je faire maintenant?',
    'Where can I find that?',
    'Can you send me the link?',
  ]) {
    const context = assistantKnowledge(question, history, findHelp);
    assert.equal(JSON.parse(context.evidence).verifiedWebsiteInformation[0]?.title, 'Product not received', question);
  }
});

test('requests to translate or explain the previous answer retain its verified policy', () => {
  for (const question of [
    'Can you translate that into French?',
    'Translate that to Dutch',
    'Can you explain that?',
    'Can you explain that in French?',
    'Kun je dat in het Nederlands vertalen?',
    'Kun je dat vertalen naar het Frans?',
    'Kun je dat uitleggen?',
    'Peux-tu traduire cela en français?',
    'Traduis cela en anglais',
    'Peux-tu expliquer cela?',
    'In English please',
    'In het Nederlands, alsjeblieft',
    'En français, s’il te plaît',
  ]) {
    const context = assistantKnowledge(question, policyHistory, findHelp);
    assert.ok(JSON.parse(context.evidence).verifiedWebsiteInformation.some(entry => entry.title === 'Refund policy'), question);
  }
});

test('a new known website topic overrides the previous policy', () => {
  const context = assistantKnowledge('Where can I buy a kit?', policyHistory, findHelp);
  assert.equal(JSON.parse(context.evidence).verifiedWebsiteInformation[0]?.title, 'Store & products');
  assert.deepEqual(context.links.map(link => link.href), ['/shop']);
  assert.equal(context.source, undefined);
});
